#!/bin/bash

# Time Tracking App - Git Remote Repository Deployment Script
# Automates the process of pushing to a remote Git repository

set -e  # Exit on error

# Colors (matching aws-deploy.sh style)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Output functions
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

# Get project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

print_status "Working directory: $PROJECT_DIR"

# Welcome message
echo "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Time Tracking App - Git Repository Deployment            ║
║                                                            ║
║   Target: Remote Git Repository                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"

# Check if Git is installed
check_git() {
    print_step "Checking Git prerequisites..."

    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi

    GIT_VERSION=$(git --version | cut -d' ' -f3)
    print_status "Detected Git version: $GIT_VERSION"
}

# Setup remote repository
setup_remote() {
    print_step "Setting up remote Git repository..."

    # Check if remote URL is provided as argument
    if [ -z "$1" ]; then
        print_status "No remote URL provided. Please enter the remote Git repository URL:"
        read -p "Remote URL (e.g., git@github.com:username/repo.git): " REMOTE_URL
    else
        REMOTE_URL="$1"
    fi

    # Check if remote already exists
    if git remote | grep -q "^origin$"; then
        print_status "Remote 'origin' already exists. Current remote URL:"
        git remote get-url origin
        
        print_status "Do you want to update the remote URL? (y/n)"
        read -p "Update remote? " UPDATE_REMOTE
        
        if [[ "$UPDATE_REMOTE" =~ ^[Yy]$ ]]; then
            print_status "Updating remote URL to: $REMOTE_URL"
            git remote set-url origin "$REMOTE_URL"
            print_success "Remote URL updated successfully"
        else
            print_status "Keeping existing remote URL"
        fi
    else
        print_status "Adding remote 'origin' with URL: $REMOTE_URL"
        git remote add origin "$REMOTE_URL"
        print_success "Remote 'origin' added successfully"
    fi
}

# Push to remote repository
push_to_remote() {
    print_step "Pushing to remote Git repository..."

    # Check if there are any changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        print_status "Uncommitted changes detected. Do you want to commit them? (y/n)"
        read -p "Commit changes? " COMMIT_CHANGES
        
        if [[ "$COMMIT_CHANGES" =~ ^[Yy]$ ]]; then
            print_status "Enter commit message:"
            read -p "Commit message: " COMMIT_MSG
            
            git add .
            git commit -m "${COMMIT_MSG:-Update application files}"
            print_success "Changes committed successfully"
        else
            print_warning "Uncommitted changes will not be pushed to remote"
        fi
    else
        print_status "Working tree clean, no changes to commit"
    fi

    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Push to remote
    print_status "Pushing to remote repository (branch: $CURRENT_BRANCH)..."
    
    if git push -u origin "$CURRENT_BRANCH"; then
        print_success "🎉 Successfully pushed to remote repository"
    else
        print_error "Failed to push to remote repository"
        print_status "You might need to pull changes first or resolve conflicts"
        exit 1
    fi
}

# Main function
main() {
    # Check Git installation
    check_git
    
    # Setup remote repository (if URL provided as argument)
    setup_remote "$1"
    
    # Push to remote repository
    push_to_remote
    
    print_success "🎉 Git deployment workflow complete!"
    echo ""
    print_status "Next steps:"
    print_status "  • Check your remote repository for the pushed changes"
    print_status "  • For AWS deployment: ./scripts/aws-deploy.sh"
}

# Execute main function with first argument as remote URL (if provided)
main "$1"