#!/bin/bash

# 强制清理 .next 目录的脚本 - 处理顽固的文件锁定和权限问题

# 严格模式
set -eo pipefail

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
print_step "强制清理 .next 目录..."

# 检查是否存在 .next 目录
if [ ! -d ".next" ]; then
    print_success ".next 目录不存在，无需清理"
    exit 0
fi

# 方法1: 检查是否有进程锁定了 .next 目录中的文件
print_step "检查是否有进程锁定了 .next 目录中的文件..."
LOCKING_PIDS=$(lsof +D .next 2>/dev/null | awk '{if (NR>1) print $2}' | sort -u)

if [ -n "$LOCKING_PIDS" ]; then
    print_warning "发现以下进程正在使用 .next 目录中的文件:"
    for PID in $LOCKING_PIDS; do
        PROCESS_NAME=$(ps -p $PID -o comm= 2>/dev/null || echo "未知进程")
        echo "  - PID: $PID ($PROCESS_NAME)"
    done
    
    read -p "是否终止这些进程? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for PID in $LOCKING_PIDS; do
            print_status "终止进程 $PID..."
            kill -15 $PID 2>/dev/null || sudo kill -15 $PID 2>/dev/null || sudo kill -9 $PID 2>/dev/null || true
        done
        print_status "等待进程终止..."
        sleep 2
    fi
fi

# 方法2: 修改文件权限
print_step "修改文件权限..."
print_status "将所有文件权限设置为可写..."
chmod -R +w .next 2>/dev/null || sudo chmod -R +w .next 2>/dev/null || true

# 方法3: 使用 find 命令逐个删除文件
print_step "使用 find 命令逐个删除文件..."
print_status "删除普通文件..."
find .next -type f -print -delete 2>/dev/null || sudo find .next -type f -print -delete 2>/dev/null || true

print_status "删除符号链接..."
find .next -type l -print -delete 2>/dev/null || sudo find .next -type l -print -delete 2>/dev/null || true

print_status "删除目录（从最深层开始）..."
find .next -depth -type d -print -delete 2>/dev/null || sudo find .next -depth -type d -print -delete 2>/dev/null || true

# 方法4: 使用 rm 命令强制删除
if [ -d ".next" ]; then
    print_step "使用 rm 命令强制删除..."
    rm -rf .next 2>/dev/null || sudo rm -rf .next 2>/dev/null || true
fi

# 方法5: 如果目录仍然存在，尝试重命名后删除
if [ -d ".next" ]; then
    print_step "尝试重命名后删除..."
    mv .next .next_old 2>/dev/null || sudo mv .next .next_old 2>/dev/null
    if [ -d ".next_old" ]; then
        rm -rf .next_old 2>/dev/null || sudo rm -rf .next_old 2>/dev/null || true
    fi
fi

# 方法6: 使用 perl 删除
if [ -d ".next" ] || [ -d ".next_old" ]; then
    print_step "使用 perl 删除目录..."
    perl -e 'use File::Path qw(remove_tree); remove_tree(".next", {safe => 0});' 2>/dev/null || true
    perl -e 'use File::Path qw(remove_tree); remove_tree(".next_old", {safe => 0});' 2>/dev/null || true
fi

# 最终检查
if [ -d ".next" ]; then
    print_error "所有方法都失败了，无法删除 .next 目录"
    print_warning "建议尝试以下操作:"
    echo "  1. 重启系统后再试"
    echo "  2. 检查磁盘是否已满或有其他问题"
    echo "  3. 检查文件系统权限"
    exit 1
else
    print_success ".next 目录已成功删除"
fi

# 清理其他构建目录
for DIR in "out" ".turbo" "node_modules/.cache"; do
    if [ -d "$DIR" ]; then
        print_status "清理 $DIR 目录..."
        rm -rf "$DIR" 2>/dev/null || sudo rm -rf "$DIR" 2>/dev/null || true
        
        if [ -d "$DIR" ]; then
            print_warning "无法删除 $DIR 目录"
        else
            print_success "$DIR 目录已成功删除"
        fi
    fi
done

print_success "清理完成，现在可以继续构建应用"