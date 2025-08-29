#!/bin/bash

# 修复 .next 目录权限问题的脚本

set -e  # 遇到错误时退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# 导航到项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "工作目录: $PROJECT_DIR"
print_step "修复 .next 目录权限问题..."

if [ -d ".next" ]; then
    print_status "尝试修复 .next 目录权限..."
    
    # 方法1: 修改文件权限
    print_status "尝试方法1: 修改文件权限..."
    find .next -type d -exec chmod 755 {} \; 2>/dev/null || true
    find .next -type f -exec chmod 644 {} \; 2>/dev/null || true
    
    # 方法2: 使用 sudo 删除
    if [ -d ".next" ]; then
        print_status "尝试方法2: 使用 sudo 删除..."
        sudo rm -rf .next
    fi
    
    # 方法3: 使用 find 命令逐个删除文件
    if [ -d ".next" ]; then
        print_status "尝试方法3: 使用 find 命令逐个删除文件..."
        find .next -type f -delete 2>/dev/null || true
        find .next -type d -delete 2>/dev/null || true
    fi
    
    # 检查是否还存在
    if [ -d ".next" ]; then
        print_warning "常规方法无法删除 .next 目录，尝试使用强制清理脚本..."
        
        # 确保强制清理脚本有执行权限
        chmod +x "$SCRIPT_DIR/force-clean-next.sh"
        
        # 执行强制清理脚本
        "$SCRIPT_DIR/force-clean-next.sh"
        
        # 再次检查
        if [ -d ".next" ]; then
            print_error "强制清理脚本也无法删除 .next 目录，请尝试重启系统后再试"
            exit 1
        else
            print_success ".next 目录已成功删除"
        fi
    else
        print_success ".next 目录已成功删除"
    fi
else
    print_success ".next 目录不存在，无需修复"
fi

# 检查 out 目录
if [ -d "out" ]; then
    print_status "尝试删除 out 目录..."
    rm -rf out 2>/dev/null || sudo rm -rf out
    
    if [ -d "out" ]; then
        print_error "无法删除 out 目录"
        exit 1
    else
        print_success "out 目录已成功删除"
    fi
fi

print_success "清理完成，现在可以继续构建应用"