#!/bin/bash

# Time Tracking App - AWS MVP Deployment Script
# Simple S3 static hosting deployment (no CloudFront)

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Output functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Get project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "Working directory: $PROJECT_DIR"

# Configuration
STACK_NAME="time-tracking-app"
DEFAULT_REGION=$(aws configure get region 2>/dev/null || echo "us-east-1")
REGION="${AWS_REGION:-$DEFAULT_REGION}"

# Welcome message
echo "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Time Tracking App - AWS MVP Deployment                   ║
║                                                            ║
║   Target: S3 Static Website Hosting                        ║
║   Region: ${REGION}                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"

# Check prerequisites
check_prerequisites() {
    print_step "Checking deployment prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not installed. Please install Node.js 18.17+ and try again."
        print_status "Installation guide: https://nodejs.org/en/download/"
        exit 1
    fi

    NODE_VERSION=$(node -v)
    print_status "Detected Node.js version: $NODE_VERSION"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not installed. Please install npm and try again."
        exit 1
    fi

    NPM_VERSION=$(npm -v)
    print_status "Detected npm version: $NPM_VERSION"

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not installed. Please install AWS CLI and try again."
        print_status "Installation guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi

    AWS_CLI_VERSION=$(aws --version 2>&1 | cut -d' ' -f1)
    print_status "Detected AWS CLI version: $AWS_CLI_VERSION"

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' to set up credentials."
        print_status "Configuration guide: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html"
        exit 1
    fi

    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
    print_success "AWS credentials configured for account $AWS_ACCOUNT"
    print_status "Current user: $AWS_USER"
    print_status "Deployment region: $REGION"
}

# Install dependencies
install_dependencies() {
    print_step "Installing project dependencies..."

    # Install npm dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing npm dependencies..."
        npm install
    else
        print_status "node_modules directory exists, skipping installation"
    fi

    # Check AWS CDK
    if ! command -v npx cdk &> /dev/null; then
        print_status "Installing AWS CDK..."
        npm install -g aws-cdk
    fi

    print_success "Dependencies installation complete"
}

# Build application
build_app() {
    print_step "Building application..."

    # Clean previous builds
    if [ -d ".next" ] || [ -d "out" ]; then
        print_status "Cleaning previous builds..."

        # Try regular deletion first
        rm -rf .next out 2>/dev/null || true

        # If directories still exist, try more aggressive cleanup
        if [ -d ".next" ] || [ -d "out" ]; then
            print_status "Performing thorough cleanup..."

            # Clean hidden fuse files and try sudo if needed
            sudo rm -rf .next/.fuse_hidden* 2>/dev/null || true
            sudo rm -rf .next out 2>/dev/null || true

            # If still having issues, kill any processes that might be locking files
            if [ -d ".next" ]; then
                print_warning "Stubborn .next directory detected, attempting process cleanup..."
                pkill -f "next" 2>/dev/null || true
                sleep 2
                sudo rm -rf .next 2>/dev/null || true
            fi
        fi
    fi

    # Build application
    print_status "Building application for static export..."

    # Use AWS-specific Next.js config
    if [ -f "next.config.aws.js" ]; then
        print_status "Using AWS-specific Next.js configuration..."
        cp next.config.js next.config.backup.js
        cp next.config.aws.js next.config.js
    fi

    npm run build

    # Restore original config
    if [ -f "next.config.backup.js" ]; then
        mv next.config.backup.js next.config.js
    fi

    # Verify output directory exists
    if [ ! -d "out" ]; then
        print_error "Build output directory 'out' not found. Check Next.js configuration."
        exit 1
    fi

    print_success "Application build complete"
}

# Deploy to AWS
deploy_to_aws() {
    print_step "Deploying to AWS..."

    # Check infrastructure directory
    if [ ! -d "infrastructure" ]; then
        print_error "Infrastructure directory not found. Please ensure project structure is correct."
        exit 1
    fi

    # Enter infrastructure directory
    cd infrastructure

    # Install CDK dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing CDK dependencies..."
        npm install
    fi

    # Bootstrap CDK if needed (first time deployment)
    print_status "Checking CDK bootstrap status..."
    if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION &> /dev/null; then
        print_status "Bootstrapping CDK for region $REGION..."
        npx cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/$REGION
    fi

    # Deploy CDK stack
    print_status "Deploying CDK stack..."
    npx cdk deploy --require-approval never

    # Return to project root
    cd "$PROJECT_DIR"

    print_success "AWS deployment complete"
}

# Show deployment outputs
show_outputs() {
    print_step "Getting deployment outputs..."

    # Get stack outputs
    OUTPUTS=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs' \
        --output json 2>/dev/null)

    if [ $? -eq 0 ] && [ "$OUTPUTS" != "null" ]; then
        echo ""
        echo "Deployment outputs:"
        echo "$OUTPUTS" | jq -r '.[] | "  \(.OutputKey): \(.OutputValue)"'
        echo ""

        # Get application URL
        WEBSITE_URL=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="WebsiteURL") | .OutputValue')
        if [ -n "$WEBSITE_URL" ] && [ "$WEBSITE_URL" != "null" ]; then
            print_success "🌐 Application URL: $WEBSITE_URL"
            echo ""
            print_status "Your Time Tracking App is now live!"
            print_status "Note: S3 website URLs use HTTP. For HTTPS, consider adding CloudFront later."
        fi

        # Get bucket name
        BUCKET_NAME=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="BucketName") | .OutputValue')
        if [ -n "$BUCKET_NAME" ] && [ "$BUCKET_NAME" != "null" ]; then
            print_status "S3 Bucket: $BUCKET_NAME"
        fi
    else
        print_warning "Unable to get deployment outputs"
    fi
}

# Main function
main() {
    # Check prerequisites
    check_prerequisites

    # Execute deployment workflow
    print_status "Starting MVP deployment workflow..."
    install_dependencies
    build_app
    deploy_to_aws
    show_outputs

    print_success "🎉 Deployment workflow complete!"
    echo ""
    print_status "Next steps:"
    print_status "  • Test your application using the URL above"
    print_status "  • Check deployment status: ./scripts/aws-status.sh"
    print_status "  • For future updates: run this script again"
    print_status "  • To clean up: aws cloudformation delete-stack --stack-name $STACK_NAME"
}

# Execute main function
main
