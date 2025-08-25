#!/bin/bash

# Time Tracking App - AWS Deployment Script
# This script deploys the application to AWS using AWS CDK

set -e  # Exit on any error

echo "☁️ Starting AWS deployment of Time Tracking App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Configuration
STACK_NAME="time-tracking-app"
REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-production}"

print_status "Deployment Configuration:"
print_status "  Stack Name: $STACK_NAME"
print_status "  Region: $REGION"
print_status "  Environment: $ENVIRONMENT"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install AWS CLI and try again."
    print_status "Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS CDK is installed
if ! command -v cdk &> /dev/null; then
    print_error "AWS CDK is not installed. Installing globally..."
    npm install -g aws-cdk
fi

print_status "AWS CLI $(aws --version) detected"
print_status "AWS CDK $(cdk --version) detected"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
print_success "AWS credentials configured for account: $AWS_ACCOUNT"

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Build the application
print_status "Building application..."
npm run build

# Create CDK infrastructure directory if it doesn't exist
if [ ! -d "infrastructure" ]; then
    print_status "Creating CDK infrastructure..."
    mkdir infrastructure
    cd infrastructure
    
    # Initialize CDK project
    cdk init app --language typescript
    
    # Install additional dependencies
    npm install @aws-cdk/aws-s3 @aws-cdk/aws-cloudfront @aws-cdk/aws-s3-deployment
    
    cd ..
fi

# Deploy using CDK
print_status "Deploying to AWS..."
cd infrastructure

# Bootstrap CDK if needed
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION &> /dev/null; then
    print_status "Bootstrapping CDK..."
    cdk bootstrap aws://$AWS_ACCOUNT/$REGION
fi

# Deploy the stack
if cdk deploy $STACK_NAME --require-approval never; then
    print_success "🎉 AWS deployment completed successfully!"
    
    # Get CloudFront URL
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
        --output text)
    
    if [ ! -z "$CLOUDFRONT_URL" ]; then
        print_success "Application URL: $CLOUDFRONT_URL"
    fi
else
    print_error "AWS deployment failed"
    exit 1
fi
