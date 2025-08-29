#!/bin/bash

# 强制清理 npm 依赖的脚本
# 此脚本使用 sudo 权限强制删除问题目录

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 输出函数
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 权限运行
if [ "$(id -u)" != "0" ]; then
    print_warning "此脚本需要 root 权限才能强制删除文件"
    print_status "正在尝试使用 sudo 重新运行..."
    exec sudo "$0" "$@"
    exit $?
fi

print_success "以 root 权限运行，可以强制删除文件"

# 获取项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "开始强制清理 npm 依赖..."
print_status "工作目录: $PROJECT_DIR"

# 保存当前用户信息（用于后续权限修复）
CURRENT_USER=$(logname 2>/dev/null || echo "$SUDO_USER" || whoami)
CURRENT_GROUP=$(id -gn "$CURRENT_USER" 2>/dev/null || echo "$CURRENT_USER")

print_status "当前用户: $CURRENT_USER"
print_status "当前用户组: $CURRENT_GROUP"

# 强制删除问题目录
print_status "强制删除 node_modules 目录..."
rm -rf node_modules

# 删除锁定文件
if [ -f "package-lock.json" ]; then
    print_status "删除 package-lock.json..."
    rm -f package-lock.json
fi

# 清理 npm 缓存
print_status "清理 npm 缓存..."
if [ "$CURRENT_USER" != "root" ]; then
    # 以原始用户身份运行npm命令
    su - "$CURRENT_USER" -c "cd \"$PROJECT_DIR\" && npm cache clean --force"
else
    npm cache clean --force
fi

# 修复权限
print_status "修复项目目录权限..."
if [ -n "$CURRENT_USER" ] && [ "$CURRENT_USER" != "root" ]; then
    chown -R "$CURRENT_USER":"$CURRENT_GROUP" "$PROJECT_DIR"
    print_status "已将所有权更改为 $CURRENT_USER:$CURRENT_GROUP"
else
    print_warning "无法确定原始用户，跳过权限修复"
fi

print_success "强制清理完成！"
print_status "现在可以尝试重新安装依赖: npm install"
print_status "然后运行部署命令: npm run deploy:aws:enhanced"

# 如果是通过sudo运行的，提示用户手动运行后续命令
if [ -n "$SUDO_USER" ]; then
    print_status "请手动运行以下命令:"
    echo "cd \"$PROJECT_DIR\""
    echo "npm install"
    echo "npm run deploy:aws:enhanced"
fi