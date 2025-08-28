# AWS 部署问题排查指南

## 常见问题及解决方案

### 1. 构建目录清理错误

**问题描述**：
```
[INFO] 清理之前的构建...
rm: cannot remove '.next': Directory not empty
```

或者：

```
npm error code ENOTEMPTY
npm error syscall rmdir
npm error path /media/brittany/internal_drive_d/time_track_app2/time_track_app2/node_modules/@next/swc-linux-x64-gnu
npm error errno -39
npm error ENOTEMPTY: directory not empty, rmdir '/media/brittany/internal_drive_d/time_track_app2/time_track_app2/node_modules/@next/swc-linux-x64-gnu'
```

**解决方案**：

1. **使用提供的清理脚本**：
```bash
# 使用清理构建目录脚本
npm run clean:build

# 或者使用修复 .next 目录脚本
npm run fix:next

# 对于顽固的 .next 目录问题，使用强制清理脚本
npm run force:clean:next
```

2. **手动解决**：
```bash
# 修复文件权限
sudo find .next -type d -exec chmod 755 {} \; 2>/dev/null
sudo find .next -type f -exec chmod 644 {} \; 2>/dev/null

# 使用 sudo 删除问题目录
sudo rm -rf .next out node_modules/.cache

# 检查是否有进程锁定了文件
lsof +D .next

# 如果有锁定进程，终止它们
# sudo kill -15 <PID>

# 清理 npm 缓存
npm cache clean --force

# 如果需要，重新安装依赖
npm install
```

3. **最后手段**：
```bash
# 如果所有方法都失败，可以尝试重启系统后再试
sudo reboot

# 或者检查磁盘空间和文件系统问题
df -h
sudo fsck -f /dev/sdXY  # 替换为实际分区
```

### 2. 构建输出目录不存在错误

**问题描述**：
```
ValidationError: Cannot find asset at /media/brittany/internal_drive_d/time_track_app2/time_track_app2/out
    at path [time-tracking-app/DeployWebsite/Asset1/Stage] in aws-cdk-lib.AssetStaging
```

**原因**：
这个错误通常是由于 Next.js 配置中的 `output` 设置与 AWS CDK 部署脚本期望的输出目录不匹配导致的。具体来说，当 Next.js 配置为 `output: 'standalone'` 时，它会将应用程序打包为一个独立的 Node.js 服务器，而不是静态 HTML 文件，这与 AWS S3 静态网站托管策略不匹配。

**解决方案**：

1. **修改 Next.js 配置**：
   在 `next.config.js` 文件中，将 `output` 设置从 `'standalone'` 更改为 `'export'`，并指定 `distDir` 为 `'out'`：

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     typedRoutes: true,
     eslint: {
       dirs: ['src'],
     },
     output: 'export',  // 从 'standalone' 改为 'export'
     distDir: 'out',    // 指定输出目录为 'out'
   }

   module.exports = nextConfig
   ```

2. **确保基础设施代码使用正确的路径**：
   在 `infrastructure/lib/infrastructure-stack.ts` 文件中，确保 `BucketDeployment` 构造使用正确的资源路径：

   ```typescript
   new s3deploy.BucketDeployment(this, 'DeployWebsite', {
     sources: [s3deploy.Source.asset('../out')],  // 确保这里是 '../out'
     destinationBucket: websiteBucket,
     distribution,
     distributionPaths: ['/*'],
   });
   ```

3. **重新构建和部署**：
   ```bash
   # 清理之前的构建
   rm -rf .next out
   
   # 重新构建
   npm run build
   
   # 部署
   ./scripts/aws-deploy.sh
   ```

### 3. AWS 凭证错误

**问题描述**：
```
Unable to locate credentials. You can configure credentials by running "aws configure".
```

**解决方案**：

1. **配置 AWS 凭证**：
   ```bash
   aws configure
   ```
   
   按照提示输入您的 AWS 访问密钥 ID、秘密访问密钥、默认区域和输出格式。

2. **检查凭证文件**：
   确保 `~/.aws/credentials` 文件存在并包含有效的凭证：
   ```bash
   cat ~/.aws/credentials
   ```
   
   文件应该类似于：
   ```
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   ```

3. **使用环境变量**：
   或者，您可以使用环境变量设置凭证：
   ```bash
   export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
   export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
   export AWS_DEFAULT_REGION=us-east-1
   ```

### 4. CloudFormation 堆栈创建失败

**问题描述**：
CloudFormation 堆栈创建失败，状态为 `CREATE_FAILED` 或 `ROLLBACK_COMPLETE`。

**解决方案**：

1. **查看失败原因**：
   ```bash
   aws cloudformation describe-stack-events \
     --stack-name time-tracking-app \
     --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`].[LogicalResourceId,ResourceStatusReason]'
   ```

2. **常见原因和解决方法**：
   
   - **S3 存储桶名称已存在**：
     修改 `infrastructure/lib/infrastructure-stack.ts` 中的存储桶名称，确保它是全球唯一的。
   
   - **权限不足**：
     确保您的 AWS 用户具有创建所需资源的权限。
   
   - **资源限制**：
     检查您的 AWS 账户是否有足够的资源限制来创建所需的资源。

3. **删除失败的堆栈**：
   如果堆栈处于 `ROLLBACK_COMPLETE` 状态，您需要先删除它，然后再重新部署：
   ```bash
   aws cloudformation delete-stack --stack-name time-tracking-app
   ```

### 5. CloudFront 缓存问题

**问题描述**：
部署后，网站仍然显示旧内容。

**解决方案**：

1. **清除 CloudFront 缓存**：
   ```bash
   ./scripts/aws-invalidate-cache.sh
   ```

2. **等待缓存过期**：
   CloudFront 缓存失效可能需要 5-15 分钟才能完全生效。

3. **清除浏览器缓存**：
   按 Ctrl+F5 或 Cmd+Shift+R 强制刷新浏览器缓存。

## 高级故障排除

### 检查 AWS CDK 部署日志

如果您需要更详细的部署日志，可以使用 `--debug` 选项：

```bash
cd infrastructure
npx cdk deploy --debug
```

### 检查 S3 存储桶内容

验证文件是否正确上传到 S3 存储桶：

```bash
# 获取存储桶名称
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name time-tracking-app \
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
  --output text)

# 列出存储桶内容
aws s3 ls s3://$BUCKET_NAME --recursive
```

### 检查 CloudFront 配置

验证 CloudFront 分发配置是否正确：

```bash
# 获取 CloudFront 分发 ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name time-tracking-app \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

# 获取分发配置
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID
```

### 检查 IAM 权限

如果遇到权限问题，可以检查当前用户的 IAM 权限：

```bash
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

## 联系支持

如果您尝试了上述所有解决方案但问题仍然存在，请联系项目维护者或 AWS 支持。