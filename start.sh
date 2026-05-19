#!/bin/bash
# Quick start script for BRIXTON Friends

set -e

echo "🚀 Starting BRIXTON Friends Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp backend/.env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Build and start containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "✅ Checking services..."
docker-compose ps

echo ""
echo "🎉 BRIXTON Friends is starting!"
echo ""
echo "📍 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:5000"
echo "💾 Database:  localhost:3306"
echo ""
echo "📖 For more information, see README.md"
echo "🚀 For EC2 deployment, see EC2_DEPLOYMENT.md"
echo ""
echo "To view logs: docker-compose logs -f"
