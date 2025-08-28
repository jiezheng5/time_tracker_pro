#!/bin/bash

# AWS 部署先决条件检查脚本
# 此脚本检查 AWS 部署所需的所有先决条件，并提供设置指导

set -e  # 遇到错误时退出

echo "🔍 检查 AWS 部署先决条件..."

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

print_header() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# 导航到项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "工作目录: $PROJECT_DIR"

# 检查 Node.js 和 npm
print_header "检查 Node.js 和 npm"

HAS_ERROR=false

if ! command -v node &> /dev/null; then
    print_error "未安装 Node.js。请安装 Node.js 18.17+ 后重试。"
    print_status "安装指南: https://nodejs.org/en/download/"
    HAS_ERROR=true
else
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.17.0"
    
    print_success "已安装 Node.js $NODE_VERSION"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        print_warning "Node.js 版本 $NODE_VERSION 低于推荐版本 $REQUIRED_VERSION+"
    fi
fi

if ! command -v npm &> /dev/null; then
    print_error "未安装 npm。请安装 npm 后重试。"
    HAS_ERROR=true
else
    print_success "已安装 npm $(npm --version)"
fi

# 检查 AWS CLI
print_header "检查 AWS CLI"

if ! command -v aws &> /dev/null; then
    print_error "未安装 AWS CLI。请安装 AWS CLI 后重试。"
    print_status "安装指南: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    HAS_ERROR=true
else
    print_success "已安装 AWS CLI $(aws --version 2>&1 | cut -d' ' -f1)"
    
    # 检查 AWS 凭证
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "未配置 AWS 凭证。请运行 'aws configure' 配置凭证。"
        print_status "配置指南: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html"
        HAS_ERROR=true
    else
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
        print_success "已为账户 $AWS_ACCOUNT 配置 AWS 凭证"
        print_status "当前用户: $AWS_USER"
    fi
fi

# 检查 AWS CDK
print_header "检查 AWS CDK"

if ! command -v npx cdk &> /dev/null; then
    print_warning "未安装 AWS CDK。部署时将自动安装。"
    print_status "如需手动安装: npm install -g aws-cdk"
else
    CDK_VERSION=$(npx cdk --version)
    print_success "已安装 AWS CDK $CDK_VERSION"
fi

# 检查项目依赖
print_header "检查项目依赖"

if [ ! -d "node_modules" ]; then
    print_warning "未安装项目依赖。部署时将自动安装。"
    print_status "如需手动安装: npm install"
else
    print_success "已安装项目依赖"
fi

# 检查 infrastructure 目录
print_header "检查项目结构"

if [ ! -d "infrastructure" ]; then
    print_error "未找到 infrastructure 目录。请确保项目结构正确。"
    HAS_ERROR=true
else
    print_success "项目结构正确"
fi

# 总结
print_header "检查结果"

if [ "$HAS_ERROR" = true ]; then
    print_error "检查发现问题，请解决上述问题后再尝试部署。"
    exit 1
else
    print_success "所有必要条件已满足，可以进行部署。"
    print_status "运行以下命令开始部署:"
    print_status "  ./scripts/aws-deploy.sh enhanced"
fi