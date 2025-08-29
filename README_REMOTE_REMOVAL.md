# 从远程仓库删除文件（但在本地保留）

## 使用方法

1. 运行脚本：
   ```bash
   ./remove_from_remote.sh
   ```

2. 提交更改：
   ```bash
   git commit -m "Remove docs, infrastructure folders and .md files (except README.md) from remote repo only"
   ```

3. 推送到远程仓库：
   ```bash
   git push origin <your-branch-name>
   ```

## 工作原理

- `git rm --cached` 命令从 Git 索引中删除文件，但不会删除本地文件
- `.gitignore` 文件确保这些文件不会被再次添加到 Git 索引中
- 这样，远程仓库中的文件将被删除，但本地文件会保留

## 脚本功能

1. **删除指定文件夹**：
   - docs
   - infrastructure
   - infrastructure-simple
   - out
   - scripts

2. **删除所有 .md 文件（保留 README.md）**：
   - 查找并从 Git 索引中删除所有 Markdown 文件，但保留 README.md
   - 排除 node_modules 和 .git 目录中的文件

## 注意事项

- 这个操作会影响所有克隆仓库的用户
- 其他用户在拉取更改后，这些文件将从他们的仓库中删除
- 如果需要共享这些文件的内容，考虑使用其他方式（如云存储）
- 确保 .gitignore 文件中包含了所有需要忽略的文件类型