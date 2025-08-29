# 项目脚本使用指南

本目录包含项目开发、构建和部署的辅助脚本。

## 脚本分类

### 开发辅助脚本（已包含在仓库中）

这些脚本可以直接使用：

- `clean-build.sh` - 清理构建目录
- `clean-cache.sh` - 清理缓存文件
- `dev-optimized.sh` - 优化开发环境
- `fix-next-dir.sh` - 修复 Next.js 目录问题
- `fix-npm-deps.sh` - 修复 npm 依赖问题
- `force-clean.sh` - 强制清理项目
- `force-clean-next.sh` - 强制清理 Next.js 缓存
- `git-deploy.sh` - Git 部署辅助脚本

### 部署脚本模板（需要配置）

这些脚本需要从模板创建并配置：

1. 复制模板文件：
   ```bash
   cp aws-deploy.sh.template aws-deploy.sh
   ```

2. 编辑脚本，填入你的配置信息：
   ```bash
   nano aws-deploy.sh
   ```

3. 确保脚本有执行权限：
   ```bash
   chmod +x aws-deploy.sh
   ```

可用的模板：
- `aws-deploy.sh.template` - AWS 部署脚本模板

## 安全注意事项

- 不要将包含敏感信息（密钥、令牌等）的脚本提交到仓库
- 使用环境变量或配置文件存储敏感信息
- 定期审查脚本中的安全风险

## 使用建议

- 在执行任何部署脚本前，先在非生产环境测试
- 保持脚本的可读性和可维护性
- 在脚本中添加适当的注释和错误处理