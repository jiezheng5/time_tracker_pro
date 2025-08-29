#!/bin/bash

# Time Tracking App - AWS Deployment Status Check Script
# This script checks AWS CloudFormation stack deployment status and displays outputs

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

# Configuration
STACK_NAME="time-tracking-app"
DEFAULT_REGION=$(aws configure get region 2>/dev/null || echo "us-east-1")
REGION="${AWS_REGION:-$DEFAULT_REGION}"

print_status "Checking AWS CloudFormation stack status..."
print_status "  Stack name: $STACK_NAME"
print_status "  Region: $REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not installed. Please install AWS CLI and try again."
    print_status "Installation guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

# Get stack status
print_step "Getting stack status..."
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].StackStatus' --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    print_error "Stack '$STACK_NAME' does not exist or is not accessible."
    print_status "Please run deployment command first: ./scripts/aws-deploy.sh"
    exit 1
fi

# Display stack status
print_status "Stack status: $STACK_STATUS"

# Show different information based on status
case $STACK_STATUS in
    "CREATE_COMPLETE"|"UPDATE_COMPLETE")
        print_success "✅ Deployment successful!"

        # Get outputs
        print_step "Getting deployment outputs..."
        echo ""
        aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs' --output table

        # Get application URL
        APP_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text)
        if [ -n "$APP_URL" ]; then
            print_success "🌐 Application URL: $APP_URL"
        fi

        # Get bucket name
        BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text)
        if [ -n "$BUCKET_NAME" ]; then
            print_status "S3 Bucket: $BUCKET_NAME"
        fi
        ;;
    "CREATE_IN_PROGRESS"|"UPDATE_IN_PROGRESS")
        print_warning "⏳ Deployment in progress..."
        print_status "You can view real-time status with:"
        print_status "aws cloudformation describe-stack-events --stack-name $STACK_NAME --region $REGION"
        ;;
    "CREATE_FAILED"|"ROLLBACK_IN_PROGRESS"|"ROLLBACK_COMPLETE"|"UPDATE_ROLLBACK_IN_PROGRESS"|"UPDATE_ROLLBACK_COMPLETE")
        print_error "❌ Deployment failed or rolled back!"
        print_status "View failure reasons:"
        aws cloudformation describe-stack-events --stack-name $STACK_NAME --region $REGION --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`UPDATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' --output table
        ;;
    *)
        print_warning "Current stack status: $STACK_STATUS"
        print_status "Use the following command to view details:"
        print_status "aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION"
        ;;
esac

echo ""
print_status "💡 Tips:"
print_status "  • To update your app: run ./scripts/aws-deploy.sh again"
print_status "  • To delete the stack: aws cloudformation delete-stack --stack-name $STACK_NAME"
print_status "  • S3 websites use HTTP. For HTTPS, consider adding CloudFront later."
