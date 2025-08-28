# Time Tracking App

基于艾森豪威尔矩阵的时间管理应用，帮助用户更有效地规划和跟踪任务。

## 功能特点

- 任务优先级管理（重要/紧急矩阵）
- 时间跟踪和统计
- 可视化报表和分析
- 响应式设计，支持移动端和桌面端
- AWS 云部署支持

## 快速开始

### 一键安装部署

使用我们的一键安装部署脚本，自动处理依赖安装和应用部署：

```bash
npm run setup
```

此脚本将：
1. 检查系统依赖
2. 安装 npm 依赖
3. 提供多种部署选项（AWS/本地/Docker）

### 手动安装

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm run start
```

## AWS 部署

详细的 AWS 部署说明请参阅 [AWS-DEPLOY.md](./AWS-DEPLOY.md)。

### 部署选项

1. **增强版部署**（推荐）：
   ```bash
   npm run deploy:aws:enhanced
   ```
   此脚本会自动处理以下步骤：
   - 安装依赖
   - 构建应用
   - 部署到 AWS
   - 创建 CloudFront 缓存失效

2. **基本部署**：
   ```bash
   npm run deploy:aws
   ```

3. **检查部署状态**：
   ```bash
   npm run deploy:aws:status
   ```

4. **查看部署输出**（包括应用 URL）：
   ```bash
   npm run deploy:aws:outputs
   ```

### 常见问题

如果在部署过程中遇到问题，请参阅 [AWS 故障排除指南](./docs/aws-troubleshooting.md)。

### 快速部署到 AWS

```bash
npm run deploy:aws:enhanced
```

### 查看部署状态

```bash
npm run deploy:aws:status
```

## 常见问题解决

### npm 依赖问题

如果遇到 npm 依赖安装问题，可以使用以下命令修复：

```bash
# 修复 npm 依赖问题
npm run fix:deps

# 如果问题仍然存在，使用强制清理（需要 sudo 权限）
npm run force:clean
```

## 开发指南

### 可用脚本

- `npm run dev` - 开发模式运行
- `npm run build` - 构建生产版本
- `npm run start` - 运行生产版本
- `npm run lint` - 代码风格检查
- `npm run type-check` - TypeScript 类型检查
- `npm run test` - 运行测试
- `npm run test:watch` - 监视模式运行测试
- `npm run test:coverage` - 生成测试覆盖率报告
- `npm run deploy:local` - 本地部署
- `npm run deploy:docker` - Docker 部署
- `npm run deploy:aws` - 标准 AWS 部署
- `npm run deploy:aws:enhanced` - 增强版 AWS 部署（推荐）
- `npm run deploy:aws:status` - 查看 AWS 部署状态
- `npm run deploy:aws:outputs` - 查看 AWS 部署输出
- `npm run fix:deps` - 修复 npm 依赖问题
- `npm run force:clean` - 强制清理 npm 依赖（需要 sudo 权限）
- `npm run setup` - 一键安装部署

## 技术栈

- **前端框架**: Next.js
- **UI 库**: React
- **样式**: Tailwind CSS
- **图表**: Chart.js
- **类型检查**: TypeScript
- **部署**: AWS CDK

## 许可证

ISC