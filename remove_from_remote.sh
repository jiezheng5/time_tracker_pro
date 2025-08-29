#!/bin/bash

# 脚本：从远程仓库中删除指定文件夹，但在本地保留
# 作者：Craft AI
# 日期：2025-08-28

echo "开始从远程仓库中删除文件夹（但在本地保留）..."

# 要删除的文件夹列表
folders=("docs" "infrastructure" "infrastructure-simple" "out" "scripts")

# 从远程仓库中删除文件夹
for folder in "${folders[@]}"; do
  echo "处理 $folder..."
  
  # 检查文件夹是否存在
  if [ -d "$folder" ]; then
    echo "  - 从 Git 索引中删除 $folder..."
    git rm -r --cached "$folder"
    echo "  - $folder 已从远程仓库索引中删除（本地文件保留）"
  else
    echo "  - $folder 文件夹不存在，跳过"
  fi
done

echo ""
echo "所有文件夹已从 Git 索引中删除"
echo "请执行以下命令完成操作："
echo ""
echo "  git commit -m \"Remove docs, infrastructure folders from remote repo only\""
echo "  git push origin <your-branch-name>"
echo ""
echo "完成后，这些文件夹将从远程仓库中删除，但在本地保留"