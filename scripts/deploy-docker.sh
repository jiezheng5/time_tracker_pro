#!/bin/bash

# Time Tracking App - Docker Deployment Script
# This script builds and runs the application using Docker

set -e  # Exit on any error

echo "🐳 Starting Docker deployment of Time Tracking App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Configuration
IMAGE_NAME="time-tracking-app"
CONTAINER_NAME="time-tracking-container"
PORT="${PORT:-3000}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker $(docker --version) detected"

# Navigate to project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    print_status "Stopping existing container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Remove existing image if it exists
if docker images --format 'table {{.Repository}}' | grep -q "^${IMAGE_NAME}$"; then
    print_status "Removing existing image..."
    docker rmi $IMAGE_NAME || true
fi

# Build Docker image
print_status "Building Docker image..."
if docker build -t $IMAGE_NAME .; then
    print_success "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Run Docker container
print_status "Starting Docker container..."
if docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3000 \
    --restart unless-stopped \
    $IMAGE_NAME; then
    print_success "🎉 Docker deployment completed successfully!"
    print_status "Application is running at: http://localhost:$PORT"
    print_status "Container name: $CONTAINER_NAME"
    print_status ""
    print_status "Useful commands:"
    print_status "  View logs: docker logs $CONTAINER_NAME"
    print_status "  Stop container: docker stop $CONTAINER_NAME"
    print_status "  Start container: docker start $CONTAINER_NAME"
    print_status "  Remove container: docker rm $CONTAINER_NAME"
else
    print_error "Failed to start Docker container"
    exit 1
fi

# Show container status
print_status "Container status:"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
