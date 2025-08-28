# AWS Deployment Documentation

This directory contains AWS deployment documentation for the Time Tracking App MVP.

## 🚀 Quick Start

**Deploy to AWS in 3 steps:**

```bash
# 1. Check prerequisites
./scripts/aws-prereqs.sh

# 2. Deploy to AWS
./scripts/aws-deploy.sh

# 3. Check status and get URL
./scripts/aws-status.sh
```

## 📚 Documentation

### Primary Guide
- **[AWS Deployment Guide](./aws-deployment-guide.md)** - Complete MVP deployment guide
  - S3 static hosting setup
  - Local-to-AWS sync workflow
  - Cost considerations and troubleshooting

### Additional Resources
- **[Deployment Lessons Learned](./deployment-lessons-learned.md)** - Critical insights and best practices
- **[AWS Troubleshooting Guide](./aws-troubleshooting.md)** - Common issues and solutions
- **[Main Deployment Guide](./deployment.md)** - All deployment options including AWS

## 🛠️ Available Scripts

- `scripts/aws-deploy.sh` - Main deployment script (MVP mode)
- `scripts/aws-status.sh` - Check deployment status and get URLs
- `scripts/aws-prereqs.sh` - Verify deployment prerequisites

## 🏗️ MVP Architecture

**Simple & Cost-Effective:**
- **S3 Bucket**: Static website hosting
- **CloudFormation**: Infrastructure as Code
- **No CloudFront**: HTTP-only (HTTPS can be added later)
- **Cost**: ~$1-5/month

## 🔄 Local Development Workflow

1. **Develop locally**: `npm run dev`
2. **Test changes**: Verify at `http://localhost:3000`
3. **Deploy to AWS**: `./scripts/aws-deploy.sh`
4. **Verify live**: Check URL from deployment output

## 💡 Key Benefits

- **No remote repository required** - Deploy directly from local code
- **Automatic infrastructure setup** - CDK handles all AWS resources
- **Fast updates** - 3-5 minutes for code changes
- **Cost-effective** - Pay only for what you use
- **Scalable** - Easy to add CloudFront/custom domains later

## 🆘 Need Help?

1. **Check status**: `./scripts/aws-status.sh`
2. **View troubleshooting**: [aws-troubleshooting.md](./aws-troubleshooting.md)
3. **Verify prerequisites**: `./scripts/aws-prereqs.sh`

## 🧹 Cleanup

To remove all AWS resources:
```bash
aws cloudformation delete-stack --stack-name time-tracking-app
```
