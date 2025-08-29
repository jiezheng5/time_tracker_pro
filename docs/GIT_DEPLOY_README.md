# Git 部署指南

这个文档提供了如何使用 `git-deploy.sh` 脚本将项目部署到远程 Git 仓库的说明。

## 使用方法

### 首次设置

首次使用时，你需要提供远程仓库的 URL：

```bash
./scripts/git-deploy.sh git@github.com:username/repo.git
```

或者

```bash
./scripts/git-deploy.sh https://github.com/username/repo.git
```

脚本会自动：
1. 检查 Git 是否已安装
2. 设置远程仓库（如果尚未设置）
3. 提示你是否要提交未提交的更改
4. 将当前分支推送到远程仓库

### 后续使用

设置好远程仓库后，你可以直接运行脚本而无需提供 URL：

```bash
./scripts/git-deploy.sh
```

## 工作流程

典型的工作流程如下：

1. 进行本地开发和测试
2. 运行 `./scripts/git-deploy.sh` 将更改推送到远程仓库
3. 运行 `./scripts/aws-deploy.sh` 部署到 AWS（如果需要）

## 注意事项

- 这个脚本不会影响现有的 AWS 部署流程
- 脚本会在推送前提示你提交任何未提交的更改
- 如果远程仓库已经设置，脚本会使用现有的配置，除非你选择更新它