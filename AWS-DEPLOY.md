# AWS 部署说明

## 概述

本文档提供了使用已配置的 AWS 凭证部署 Time Tracking App 的简要说明。

## 快速部署

确保您已经设置了 `~/.aws/config` 和 `~/.aws/credentials` 文件，然后运行：

```bash
npm run deploy:aws:enhanced
```

此命令将：
1. 自动从 `~/.aws/config` 读取您的默认区域设置
2. 安装所有必要的依赖
3. 构建应用程序
4. 部署到 AWS CloudFormation
5. 提供应用程序访问 URL

## 详细说明

有关更详细的部署说明，请参阅：

- [AWS 快速部署指南](./docs/aws-deployment-quick-guide.md) - 简要部署步骤
- [AWS 部署指南](./docs/aws-deployment-guide.md) - 完整部署文档
- [AWS 故障排除](./docs/aws-troubleshooting.md) - 常见问题解决方案

## 部署脚本

项目包含以下部署脚本：

- `npm run deploy:aws` - 标准部署脚本
- `npm run deploy:aws:enhanced` - 增强版部署脚本（推荐）
- `npm run deploy:aws:status` - 查看部署状态
- `npm run fix:deps` - 修复 npm 依赖问题

## 常见问题解决

### 1. npm 安装问题

如果遇到 npm 依赖安装问题，请按照以下步骤操作：

1. 运行依赖修复脚本：
   ```bash
   npm run fix:deps
   ```

2. 如果问题仍然存在，使用强制清理脚本（需要 sudo 权限）：

### 2. 构建输出目录问题

如果您遇到 "Cannot find asset at /path/to/out" 错误，请检查以下内容：

1. **Next.js 配置**：
   确保 `next.config.js` 文件中的 `output` 设置为 `'export'` 而不是 `'standalone'`，并且 `distDir` 设置为 `'out'`：
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     distDir: 'out',
   }
   ```

2. **基础设施代码**：
   确保 `infrastructure/lib/infrastructure-stack.ts` 文件中的 `BucketDeployment` 构造使用正确的路径 `'../out'`：
   ```typescript
   new s3deploy.BucketDeployment(this, 'DeployWebsite', {
     sources: [s3deploy.Source.asset('../out')],
   });
   ```

3. **重新构建和部署**：
   ```bash
   # 清理之前的构建
   rm -rf .next out

   # 重新构建
   npm run build

   # 重新部署
   npm run deploy:aws:enhanced
   ```
   ```bash
   sudo ./scripts/force-clean.sh
   ```

3. 然后重新安装依赖：
   ```bash
   npm install
   ```

4. 最后运行部署命令：
   ```bash
   npm run deploy:aws:enhanced
   ```

### 常见错误及解决方案

#### "npm ci" 命令错误

错误信息：
```
npm error code EUSAGE
npm error The `npm ci` command can only install with an existing package-lock.json
```

解决方案：
- 已优化部署脚本，现在会自动检测是否存在有效的 package-lock.json 文件
- 如果不存在，会自动使用 `npm install` 代替 `npm ci`

#### "Directory not empty" 错误

错误信息：
```
Error: ENOTEMPTY: directory not empty
```

解决方案：
- 运行强制清理脚本：`sudo ./scripts/force-clean.sh`
- 此脚本会使用 root 权限强制删除问题目录并修复权限