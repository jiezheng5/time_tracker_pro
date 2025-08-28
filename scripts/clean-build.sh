#!/bin/bash

# 清理构建输出目录
print_status "清理构建输出..."

# 修复目录权限
sudo chown -R $(whoami):$(whoami) .next out 2>/dev/null

# 删除 .next 目录
if [ -d ".next" ]; then
    rm -rf .next
    print_success "已删除 .next 目录"
fi

# 删除 out 目录
if [ -d "out" ]; then
    rm -rf out
    print_success "已删除 out 目录"
fi

print_success "清理完成"

# 辅助函数
print_status() {
    echo "[STATUS] $1"
}

print_success() {
    echo "[SUCCESS] $1"
}