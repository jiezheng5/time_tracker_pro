#!/bin/bash

# 修复 npm 依赖问题的脚本
# 主要解决 Linux 系统上的权限和锁定文件问题

set -e  # 遇到错误时退出

echo "🔧 开始修复 npm 依赖问题..."

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

# 获取项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "工作目录: $PROJECT_DIR"

# 检查是否存在问题目录
if [ -d "node_modules/@next/swc-linux-x64-gnu" ]; then
    print_warning "检测到可能有问题的依赖目录，尝试修复..."
    
    # 修复文件权限
    print_status "修复文件权限..."
    find node_modules -type d -name "swc-linux-x64-gnu" -exec chmod -R 777 {} \; 2>/dev/null || true
    
    # 删除问题目录
    print_status "删除问题目录..."
    rm -rf node_modules/@next/swc-linux-x64-gnu 2>/dev/null || true
fi

# 检查是否存在其他常见问题目录
PROBLEM_DIRS=(
    "node_modules/@next/swc-linux-x64-musl"
    "node_modules/@next/swc-darwin-x64"
    "node_modules/@next/swc-darwin-arm64"
    "node_modules/@next/swc-win32-x64-msvc"
    "node_modules/@next/swc-win32-ia32-msvc"
    "node_modules/@next/swc-win32-arm64-msvc"
)

for dir in "${PROBLEM_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "检测到可能有问题的目录: $dir，尝试修复..."
        chmod -R 777 "$dir" 2>/dev/null || true
        rm -rf "$dir" 2>/dev/null || true
    fi
done

# 清理 npm 缓存
print_status "清理 npm 缓存..."
npm cache clean --force

# 验证缓存
print_status "验证 npm 缓存..."
npm cache verify

# 删除锁定文件
if [ -f "package-lock.json" ]; then
    print_status "删除 package-lock.json..."
    rm -f package-lock.json
fi

# 删除 node_modules 目录
print_status "删除 node_modules 目录..."
rm -rf node_modules

# 检查是否需要提升权限
if [ $? -ne 0 ]; then
    print_warning "无法删除某些文件，可能需要更高权限"
    print_status "请尝试运行强制清理脚本: sudo ./scripts/force-clean.sh"
    exit 1
fi

# 重新安装依赖
print_status "重新安装依赖..."
npm install --no-fund --no-audit

if [ $? -eq 0 ]; then
    print_success "✅ npm 依赖修复完成！"
else
    print_error "❌ 依赖安装失败"
    print_status "请尝试运行强制清理脚本: sudo ./scripts/force-clean.sh"
    exit 1
fi