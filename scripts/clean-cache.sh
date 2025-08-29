#!/bin/bash

# Time Tracking App - Cache Cleanup Script
# 此脚本清理开发环境中的各种缓存，解决性能和加载问题

set -e  # 遇到错误时退出

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

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "🧹 开始清理缓存..."
print_status "工作目录: $PROJECT_DIR"

# 清理 Next.js 缓存
print_status "清理 Next.js 缓存..."
rm -rf .next
rm -rf out

# 清理 Node 模块缓存
print_status "清理 Node 模块缓存..."
rm -rf node_modules/.cache

# 清理浏览器缓存提示
print_warning "请注意: 您可能还需要清理浏览器缓存"
print_warning "Chrome: Ctrl+Shift+Del → 缓存的图片和文件 → 清除数据"
print_warning "Firefox: Ctrl+Shift+Del → 缓存 → 清除"
print_warning "Edge: Ctrl+Shift+Del → 缓存的图片和文件 → 清除"

print_success "🎉 缓存清理完成!"
print_status "现在可以使用 'npm run dev:fast' 启动优化的开发服务器"