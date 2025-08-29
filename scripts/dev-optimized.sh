#!/bin/bash

# Time Tracking App - Optimized Development Script
# 此脚本优化开发环境启动速度和性能

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

print_status "🚀 启动优化的开发环境..."
print_status "工作目录: $PROJECT_DIR"

# 清理缓存
print_status "清理 Next.js 缓存..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# 设置环境变量以优化开发体验
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1

# 启动开发服务器
print_success "缓存已清理，正在启动优化的开发服务器..."
print_status "应用将在 http://localhost:3000 可用"
print_status "按 Ctrl+C 停止服务器"

# 使用 NODE_ENV=development 确保使用开发模式配置
NODE_ENV=development npx next dev