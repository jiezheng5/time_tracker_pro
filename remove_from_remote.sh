#!/bin/bash

# 脚本用于从远程仓库中删除指定文件夹，但在本地保留
# 作者：Craft AI
# 日期：2025-08-28

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}准备从远程仓库中删除文件夹，但在本地保留${NC}"
echo -e "${YELLOW}这将使用 git rm --cached -r 命令${NC}"
echo -e "${RED}警告：此操作不可逆，请确保已备份重要数据${NC}"
echo ""

# 确认操作
read -p "是否继续? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}操作已取消${NC}"
    exit 1
fi

# 要删除的文件夹列表
folders=("docs" "infrastructure" "infrastructure-simple" "out" "scripts")

# 从远程仓库中删除文件夹
for folder in "${folders[@]}"
do
    if [ -d "$folder" ]; then
        echo -e "${YELLOW}从远程仓库中删除 $folder 文件夹...${NC}"
        git rm --cached -r "$folder"
        echo -e "${GREEN}$folder 已从远程仓库中删除，但在本地保留${NC}"
    else
        echo -e "${RED}$folder 文件夹不存在，跳过${NC}"
    fi
done

# 提交更改
echo -e "${YELLOW}提交更改...${NC}"
git commit -m "Remove docs, infrastructure, infrastructure-simple, out, scripts folders from remote repo only"

echo ""
echo -e "${GREEN}操作完成！${NC}"
echo -e "${YELLOW}请使用 git push 命令将更改推送到远程仓库${NC}"
echo -e "${YELLOW}示例: git push origin master${NC}"