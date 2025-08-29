## 使用强制清理脚本解决权限问题

如果你在运行 `fix-npm-deps.sh` 脚本时遇到 "Directory not empty" 错误，这通常是由于文件权限问题导致的。我们提供了一个强制清理脚本，使用 sudo 权限来解决这个问题。

### 步骤 1: 运行强制清理脚本

```bash
# 使用 sudo 运行强制清理脚本
sudo ./scripts/force-clean.sh
```

这个脚本会：
1. 以 root 权限运行，确保能够删除所有文件
2. 强制删除 node_modules 目录
3. 清理 npm 缓存
4. 修复项目目录的所有权限

### 步骤 2: 重新安装依赖

```bash
# 安装依赖
npm install
```

### 步骤 3: 使用增强版部署脚本

```bash
# 使用增强版部署脚本
npm run deploy:aws:enhanced
```

## 常见权限问题的解决方案

### 1. 外部驱动器权限问题

如果你的项目位于外部驱动器（如 USB 驱动器或网络挂载），可能会遇到权限问题。

**解决方案**：
```bash
# 修复项目目录权限
sudo chown -R $(whoami):$(whoami) /media/brittany/internal_drive_d/time_track_app2
```

### 2. npm 缓存损坏

npm 缓存损坏也可能导致安装问题。

**解决方案**：
```bash
# 清理 npm 缓存
npm cache clean --force

# 验证缓存
npm cache verify
```

### 3. Node.js 版本兼容性问题

某些 npm 包可能与特定版本的 Node.js 不兼容。

**解决方案**：
```bash
# 检查 Node.js 版本
node --version

# 如果需要，安装推荐的 Node.js 版本（18.17 或更高）
# 使用 nvm 安装特定版本
nvm install 18.17
nvm use 18.17
```