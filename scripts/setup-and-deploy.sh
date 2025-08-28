#!/bin/bash

# Time Tracking App - 一键安装部署脚本
# 此脚本自动处理依赖安装和应用部署

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

# 获取项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "工作目录: $PROJECT_DIR"

# 显示欢迎信息
echo "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Time Tracking App - 一键安装部署工具                     ║
║                                                            ║
║   此脚本将自动执行以下操作:                                ║
║   1. 检查系统依赖                                          ║
║   2. 安装 npm 依赖                                         ║
║   3. 部署应用到 AWS                                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"

# 检查系统依赖
print_step "检查系统依赖..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    print_error "未安装 Node.js。请安装 Node.js 后重试。"
    print_status "安装指南: https://nodejs.org/en/download/"
    exit 1
fi

NODE_VERSION=$(node -v)
print_status "检测到 Node.js 版本: $NODE_VERSION"

# 检查 npm
if ! command -v npm &> /dev/null; then
    print_error "未安装 npm。请安装 npm 后重试。"
    exit 1
fi

NPM_VERSION=$(npm -v)
print_status "检测到 npm 版本: $NPM_VERSION"

# 检查 AWS CLI
if ! command -v aws &> /dev/null; then
    print_warning "未安装 AWS CLI。部署到 AWS 需要安装 AWS CLI。"
    
    read -p "是否要安装 AWS CLI? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "正在安装 AWS CLI..."
        
        # 检测操作系统并安装 AWS CLI
        if [ -f /etc/debian_version ]; then
            # Debian/Ubuntu
            sudo apt-get update && sudo apt-get install -y awscli
        elif [ -f /etc/redhat-release ]; then
            # CentOS/RHEL
            sudo yum install -y awscli
        elif [ -f /etc/arch-release ]; then
            # Arch Linux
            sudo pacman -S --noconfirm aws-cli
        elif command -v brew &> /dev/null; then
            # macOS with Homebrew
            brew install awscli
        else
            print_warning "无法自动安装 AWS CLI。请手动安装后重试。"
            print_status "安装指南: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
            exit 1
        fi
    else
        print_warning "跳过 AWS CLI 安装。部署到 AWS 的功能将不可用。"
    fi
fi

# 检查 AWS 凭证
if command -v aws &> /dev/null; then
    if ! aws sts get-caller-identity &> /dev/null; then
        print_warning "未配置 AWS 凭证。部署到 AWS 需要配置 AWS 凭证。"
        
        read -p "是否要配置 AWS 凭证? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "请按照提示配置 AWS 凭证..."
            aws configure
        else
            print_warning "跳过 AWS 凭证配置。部署到 AWS 的功能将不可用。"
        fi
    else
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        print_success "已为账户 $AWS_ACCOUNT 配置 AWS 凭证"
    fi
fi

# 安装依赖
print_step "安装项目依赖..."

# 检查是否存在问题目录
if [ -d "node_modules/@next/swc-linux-x64-gnu" ]; then
    print_warning "检测到可能有问题的依赖目录，尝试修复..."
    
    # 尝试运行修复脚本
    if [ -f "./scripts/fix-npm-deps.sh" ]; then
        print_status "运行依赖修复脚本..."
        chmod +x ./scripts/fix-npm-deps.sh
        if ! ./scripts/fix-npm-deps.sh; then
            print_warning "修复脚本未能完全解决问题，尝试强制清理..."
            
            # 尝试运行强制清理脚本
            if [ -f "./scripts/force-clean.sh" ]; then
                print_status "运行强制清理脚本..."
                chmod +x ./scripts/force-clean.sh
                if ! sudo ./scripts/force-clean.sh; then
                    print_error "强制清理失败。请手动删除 node_modules 目录后重试。"
                    print_status "手动命令: sudo rm -rf node_modules && npm cache clean --force && npm install"
                    exit 1
                fi
            fi
        fi
    fi
fi

# 尝试安装依赖
print_status "安装依赖..."

# 检查是否存在package-lock.json文件
VALID_LOCKFILE=false

if [ -f "package-lock.json" ]; then
    if command -v jq &> /dev/null; then
        # 使用jq检查lockfileVersion
        LOCKFILE_VERSION=$(jq -r '.lockfileVersion' package-lock.json 2>/dev/null)
        if [ "$LOCKFILE_VERSION" -ge "1" ] 2>/dev/null; then
            VALID_LOCKFILE=true
        fi
    else
        # 备用方法：使用grep检查lockfileVersion
        if grep -q '"lockfileVersion": [1-9]' package-lock.json 2>/dev/null; then
            VALID_LOCKFILE=true
        fi
    fi
fi

if [ "$VALID_LOCKFILE" = true ]; then
    print_status "检测到有效的package-lock.json，使用npm ci安装..."
    if ! npm ci; then
        print_warning "使用 npm ci 安装依赖失败，尝试使用 npm install..."
        if ! npm install --no-fund --no-audit; then
            print_error "依赖安装失败。请尝试以下步骤："
            print_status "1. 运行修复脚本: ./scripts/fix-npm-deps.sh"
            print_status "2. 如果仍然失败，运行强制清理脚本: sudo ./scripts/force-clean.sh"
            print_status "3. 然后重新运行此脚本"
            exit 1
        fi
    fi
else
    print_status "未检测到有效的package-lock.json，使用npm install安装..."
    if ! npm install --no-fund --no-audit; then
        print_error "依赖安装失败。请尝试以下步骤："
        print_status "1. 运行修复脚本: ./scripts/fix-npm-deps.sh"
        print_status "2. 如果仍然失败，运行强制清理脚本: sudo ./scripts/force-clean.sh"
        print_status "3. 然后重新运行此脚本"
        exit 1
    fi
fi

print_success "依赖安装完成！"

# 部署选项
echo
print_step "选择部署选项:"
echo "1) 部署到 AWS (推荐)"
echo "2) 本地部署"
echo "3) Docker 部署"
echo "4) 仅安装依赖，不部署"
echo

read -p "请选择部署选项 (1-4): " -n 1 -r
echo
case $REPLY in
    1)
        print_status "开始部署到 AWS..."
        if [ -f "./scripts/deploy-aws-enhanced.sh" ]; then
            chmod +x ./scripts/deploy-aws-enhanced.sh
            ./scripts/deploy-aws-enhanced.sh
        else
            print_error "未找到 AWS 部署脚本。"
            exit 1
        fi
        ;;
    2)
        print_status "开始本地部署..."
        if [ -f "./scripts/deploy-local.sh" ]; then
            chmod +x ./scripts/deploy-local.sh
            ./scripts/deploy-local.sh
        else
            print_status "未找到本地部署脚本，使用默认命令..."
            npm run build && npm run start
        fi
        ;;
    3)
        print_status "开始 Docker 部署..."
        if [ -f "./scripts/deploy-docker.sh" ]; then
            chmod +x ./scripts/deploy-docker.sh
            ./scripts/deploy-docker.sh
        else
            print_error "未找到 Docker 部署脚本。"
            exit 1
        fi
        ;;
    4)
        print_success "依赖安装完成，跳过部署步骤。"
        print_status "您可以使用以下命令手动部署:"
        print_status "- AWS 部署: npm run deploy:aws:enhanced"
        print_status "- 本地部署: npm run dev"
        print_status "- Docker 部署: npm run deploy:docker"
        ;;
    *)
        print_error "无效的选项。"
        exit 1
        ;;
esac

print_success "脚本执行完成！"