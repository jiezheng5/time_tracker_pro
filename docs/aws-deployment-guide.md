# AWS Deployment Guide - MVP

## Overview

This guide provides instructions for deploying the Time Tracking App to AWS using a simple, cost-effective approach. The MVP deployment uses S3 static website hosting without CloudFront, making it perfect for development, testing, and small-scale production use.

## Architecture

**MVP Deployment Stack:**
- **S3 Bucket**: Static website hosting with public read access
- **CloudFormation**: Infrastructure as Code management
- **No CloudFront**: Simplified setup, HTTP-only (HTTPS can be added later)

## Prerequisites

1. **AWS Account**: Valid AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with your credentials
3. **Node.js**: Version 18.17 or higher
4. **npm**: For dependency management and build scripts

## Quick Start

### 1. Check Prerequisites

Before deployment, verify all requirements are met:

```bash
# Check deployment prerequisites
./scripts/aws-prereqs.sh
```

### 2. Deploy to AWS

Run the deployment script:

```bash
# Deploy to AWS (MVP mode)
./scripts/aws-deploy.sh
```

The deployment script will:
1. Install all necessary dependencies
2. Build the application for static export
3. Bootstrap AWS CDK (if first time)
4. Deploy infrastructure via CloudFormation
5. Upload website files to S3
6. Provide the application URL

### 3. Check Deployment Status

After deployment, check the status:

```bash
# Check deployment status
./scripts/aws-status.sh
```

## Local Development to AWS Sync Workflow

### Making Changes and Updating AWS

When you make changes to your local application:

1. **Test locally first**:
   ```bash
   npm run dev
   # Test your changes at http://localhost:3000
   ```

2. **Deploy updates to AWS**:
   ```bash
   ./scripts/aws-deploy.sh
   # This rebuilds and redeploys automatically
   ```

3. **Verify deployment**:
   ```bash
   ./scripts/aws-status.sh
   # Check status and get the live URL
   ```

## Frequently Asked Questions

### Do I need a remote Git repository?

**No.** The deployment script works directly from your local code. No need to push to a remote repository first.

### Where are AWS credentials configured?

AWS credentials are stored in `~/.aws/credentials` and automatically used by AWS CLI. Make sure you've run `aws configure` with valid credentials.

### How long does deployment take?

- **First deployment**: 10-15 minutes (creates all AWS resources)
- **Updates**: 3-5 minutes (just updates files and stack)

### How do I handle caching issues?

**S3 Static Hosting**: Updates are usually immediate. If you see old content, try:
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Wait 1-2 minutes for S3 propagation

### How do I change deployment region?

Use environment variables to override the default region:

```bash
# Deploy to Europe (Ireland)
AWS_REGION=eu-west-1 ./scripts/aws-deploy.sh

# Deploy to Asia Pacific (Tokyo)
AWS_REGION=ap-northeast-1 ./scripts/aws-deploy.sh
```

### What about HTTPS?

The MVP deployment uses HTTP only. For HTTPS, you can:
1. Add CloudFront distribution later
2. Use a custom domain with SSL certificate
3. This keeps the initial setup simple and cost-effective

## Cost Considerations

**MVP deployment costs** (estimated monthly):
- **S3 Storage**: ~$0.50-2.00 (depending on usage)
- **S3 Requests**: ~$0.10-1.00 (depending on traffic)
- **Data Transfer**: Free for first 1GB, then ~$0.09/GB

**Total estimated cost**: $1-5/month for typical usage

## Troubleshooting

### Common Issues

1. **Build fails**: Check that `next.config.js` has `output: 'export'`
2. **AWS credentials error**: Run `aws configure` to set up credentials
3. **Stack creation fails**: Check AWS permissions and region availability
4. **Website shows 404**: Verify the `out` directory was created during build

### Getting Help

- Check deployment status: `./scripts/aws-status.sh`
- View CloudFormation events in AWS Console
- Check the troubleshooting guide: `docs/aws-troubleshooting.md`

## Next Steps

After successful MVP deployment:

1. **Test thoroughly**: Verify all app features work in the live environment
2. **Monitor costs**: Check AWS billing dashboard
3. **Plan scaling**: Consider CloudFront for global users or high traffic
4. **Custom domain**: Set up Route 53 and SSL certificates if needed
5. **Backup strategy**: Consider versioning and backup policies

## Cleanup

To remove all AWS resources:

```bash
# Delete the CloudFormation stack
aws cloudformation delete-stack --stack-name time-tracking-app

# Verify deletion
aws cloudformation describe-stacks --stack-name time-tracking-app
```

**Note**: This will permanently delete your S3 bucket and all files.
