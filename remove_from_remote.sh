#!/bin/bash

# 脚本：从远程仓库中删除指定文件夹和 .md 文件（保留 README.md），但在本地保留
# 作者：Craft AI
# 日期：2025-08-28
# 更新：添加确认机制和错误处理

# 设置错误处理
set -e  # 遇到错误时退出脚本

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

# 显示警告信息
echo -e "${YELLOW}警告：此脚本将从远程仓库中删除指定文件夹和文件，但在本地保留${NC}"
echo -e "${YELLOW}这将影响所有协作者的远程仓库视图${NC}"
echo ""

# 请求用户确认
read -p "是否继续执行？(y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo -e "${RED}操作已取消${NC}"
    exit 0
fi

echo -e "${GREEN}开始从远程仓库中删除文件夹和 .md 文件（但在本地保留）...${NC}"

# 要删除的文件夹列表
folders=("docs" "infrastructure" "infrastructure-simple" "out" "scripts")

# 从远程仓库中删除文件夹
echo "第 1 步：删除指定文件夹..."
for folder in "${folders[@]}"; do
  echo "处理 $folder..."

  # 检查文件夹是否存在
  if [ -d "$folder" ]; then
    echo "  - 从 Git 索引中删除 $folder..."
    if git rm -r --cached "$folder" 2>/dev/null; then
      echo -e "${GREEN}  - $folder 已从远程仓库索引中删除（本地文件保留）${NC}"
    else
      echo -e "${YELLOW}  - $folder 不在 Git 索引中，跳过${NC}"
    fi
  else
    echo -e "${YELLOW}  - $folder 文件夹不存在，跳过${NC}"
  fi
done

# 从远程仓库中删除所有 .gitignore 文件
echo ""
echo "第 2 步：删除所有 .gitignore 文件..."

# 使用更安全的循环方式处理文件
found_files=0
skipped_files=0
while IFS= read -r -d $'\0' file; do
  echo "  - 处理 $file..."
  if git rm --cached "$file" 2>/dev/null; then
    echo -e "${GREEN}  - $file 已从远程仓库索引中删除${NC}"
    found_files=$((found_files + 1))
  else
    echo -e "${YELLOW}  - $file 不在 Git 索引中，跳过${NC}"
    skipped_files=$((skipped_files + 1))
  fi
done < <(find . -type f -name "*.gitignore" ! -path "*/node_modules/*" ! -path "*/.git/*" -print0)

if [ "$found_files" -eq 0 ]; then
  echo -e "${YELLOW}  - 未找到需要删除的 .gitignore 文件${NC}"
else
  echo -e "${GREEN}  - 成功删除 $found_files 个 .gitignore 文件${NC}"
fi

if [ "$skipped_files" -gt 0 ]; then
  echo -e "${YELLOW}  - 跳过 $skipped_files 个不在 Git 索引中的文件${NC}"
fi


# 从远程仓库中删除所有 .md 文件（除了 README.md）
echo ""
echo "第 3 步：删除所有 .md 文件（保留 README.md）..."

# 使用更安全的循环方式处理文件
found_files=0
skipped_files=0
while IFS= read -r -d $'\0' file; do
  echo "  - 处理 $file..."
  if git rm --cached "$file" 2>/dev/null; then
    echo -e "${GREEN}  - $file 已从远程仓库索引中删除${NC}"
    found_files=$((found_files + 1))
  else
    echo -e "${YELLOW}  - $file 不在 Git 索引中，跳过${NC}"
    skipped_files=$((skipped_files + 1))
  fi
done < <(find . -type f -name "*.md" ! -name "README.md" ! -path "*/node_modules/*" ! -path "*/.git/*" -print0)

if [ "$found_files" -eq 0 ]; then
  echo -e "${YELLOW}  - 未找到需要删除的 .md 文件${NC}"
else
  echo -e "${GREEN}  - 成功删除 $found_files 个 .md 文件${NC}"
fi

if [ "$skipped_files" -gt 0 ]; then
  echo -e "${YELLOW}  - 跳过 $skipped_files 个不在 Git 索引中的文件${NC}"
fi

echo ""
echo "所有文件夹和指定的 .md 文件已从 Git 索引中删除"
echo "请执行以下命令完成操作："
echo ""
echo "  git commit -m \"Remove docs, infrastructure folders and .md files (except README.md) from remote repo only\""
echo "  git push origin <your-branch-name>"
echo ""
echo "完成后，这些文件夹和 .md 文件将从远程仓库中删除，但在本地保留"
