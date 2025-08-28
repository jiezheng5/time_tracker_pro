# Deployment Quick Reference

## 🚀 Quick Commands

### Local Development
```bash
npm run dev                    # Start development server
npm run build                  # Build for production (local)
npm run start                  # Start production server locally
```

### AWS Deployment
```bash
./scripts/aws-prereqs.sh       # Check prerequisites
./scripts/aws-deploy.sh        # Deploy to AWS
./scripts/aws-status.sh        # Check deployment status
```

### Cleanup
```bash
rm -rf .next out               # Clean build directories
sudo rm -rf .next              # Force clean if needed
```

## ⚡ Performance Tips

### Local Development
- Keep `next.config.js` minimal for speed
- Use separate config for AWS deployment
- Clean build directories if experiencing issues

### AWS Deployment
- First deployment takes 10-15 minutes (includes bootstrap)
- Subsequent deployments take 2-3 minutes
- Cost: ~$1-5/month for typical usage

## 🔧 Common Issues & Quick Fixes

### "Directory not empty" Error
```bash
sudo rm -rf .next/.fuse_hidden*
sudo rm -rf .next out
```

### "Cannot find asset" Error
- Check `next.config.aws.js` has `output: 'export'`
- Verify `out` directory exists after build

### AWS Credentials Error
```bash
aws configure                  # Set up credentials
aws sts get-caller-identity    # Verify credentials
```

### Slow Local Development
- Ensure `next.config.js` doesn't have `output: 'export'`
- Use `next.config.aws.js` only for AWS builds

## 📁 File Structure

```
├── next.config.js             # Fast local development
├── next.config.aws.js         # AWS deployment config
├── scripts/
│   ├── aws-deploy.sh          # Main deployment script
│   ├── aws-status.sh          # Status checker
│   └── aws-prereqs.sh         # Prerequisites checker
└── docs/
    ├── deployment-lessons-learned.md  # Comprehensive guide
    ├── aws-deployment-guide.md        # AWS instructions
    └── aws-troubleshooting.md         # Issue solutions
```

## 🎯 Success Checklist

### Before Deployment
- [ ] AWS CLI configured (`aws configure`)
- [ ] Node.js 18.17+ installed
- [ ] Local development working (`npm run dev`)

### After Deployment
- [ ] Application accessible at provided URL
- [ ] All features working correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

## 🔗 Key URLs

- **Live App**: Check deployment output or run `./scripts/aws-status.sh`
- **AWS Console**: https://console.aws.amazon.com/cloudformation/
- **Documentation**: `docs/deployment-lessons-learned.md`

## 💡 Pro Tips

1. **Always test locally first** before deploying to AWS
2. **Use the status script** to get live URL and check health
3. **Keep deployment scripts updated** as requirements change
4. **Document any new issues** in the lessons learned guide
5. **Monitor AWS costs** regularly in the billing dashboard

## 🆘 Emergency Procedures

### Rollback Deployment
```bash
# Check previous versions in AWS Console
# Or delete and redeploy
aws cloudformation delete-stack --stack-name time-tracking-app
```

### Complete Reset
```bash
# Clean everything locally
rm -rf .next out node_modules
npm install
npm run dev  # Verify local works
./scripts/aws-deploy.sh  # Redeploy
```

### Get Help
1. Check `docs/deployment-lessons-learned.md`
2. Run `./scripts/aws-status.sh` for current status
3. Review AWS CloudFormation events in console
4. Check this quick reference for common solutions

---

*Last updated: 2025-01-25*
*For detailed information, see: `docs/deployment-lessons-learned.md`*
