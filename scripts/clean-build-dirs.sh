#!/bin/bash

# 清理构建目录的脚本

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
print_step "清理构建目录..."

# 清理构建目录
DIRS_TO_CLEAN=(".next" "out" ".turbo" "node_modules/.cache")

for dir in "${DIRS_TO_CLEAN[@]}"; do
    if [ -d "$dir" ]; then
        print_status "清理 $dir 目录..."
        
        # 尝试常规删除
        rm -rf "$dir" 2>/dev/null || true
        
        # 如果常规删除失败，尝试其他方法
        if [ -d "$dir" ]; then
            print_warning "常规删除 $dir 失败，尝试其他方法..."
            
            # 方法1: 修改文件权限
            find "$dir" -type d -exec chmod 755 {} \; 2>/dev/null || true
            find "$dir" -type f -exec chmod 644 {} \; 2>/dev/null || true
            rm -rf "$dir" 2>/dev/null || true
            
            # 方法2: 使用 sudo
            if [ -d "$dir" ]; then
                print_warning "尝试使用 sudo 删除 $dir..."
                sudo rm -rf "$dir" 2>/dev/null || true
            fi
            
            # 检查是否还存在
            if [ -d "$dir" ]; then
                # 如果是 .next 目录，尝试使用强制清理脚本
                if [ "$dir" = ".next" ]; then
                    print_warning "常规方法无法删除 .next 目录，尝试使用强制清理脚本..."
                    
                    # 确保强制清理脚本有执行权限
                    chmod +x "$SCRIPT_DIR/force-clean-next.sh"
                    
                    # 执行强制清理脚本
                    "$SCRIPT_DIR/force-clean-next.sh"
                    
                    # 再次检查
                    if [ -d ".next" ]; then
                        print_error "强制清理脚本也无法删除 .next 目录，请尝试重启系统后再试"
                    else
                        print_success ".next 目录已成功删除"
                    fi
                else
                    print_error "无法删除 $dir 目录"
                fi
            else
                print_success "$dir 目录已成功删除"
            fi
        else
            print_success "$dir 目录已成功删除"
        fi
    else
        print_status "$dir 目录不存在，无需清理"
    fi
done

print_success "构建目录清理完成"
print_status "现在可以重新构建应用"