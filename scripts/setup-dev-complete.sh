#!/bin/bash

# 🚀 Setup script for development environment
# This script sets up everything needed for development

set -e

echo "🚀 Setting up development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Setup Git hooks
echo "🔧 Setting up Git hooks..."
npx husky install

# Create .env.development if it doesn't exist
if [ ! -f .env.development ]; then
    echo "📄 Creating .env.development from example..."
    cp .env.example .env.development
    echo "⚠️  Please update .env.development with your actual values"
fi

# Setup database
echo "🗄️  Setting up database..."
if [ -f "prisma/schema.prisma" ]; then
    npm run prisma:generate
    npm run prisma:migrate
    echo "✅ Database setup complete"
else
    echo "⚠️  No Prisma schema found, skipping database setup"
fi

# Run linting and formatting
echo "🔍 Running initial code quality checks..."
npm run lint:fix
npm run format

# Run tests
echo "🧪 Running tests..."
npm run test

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update .env.development with your values"
echo "  2. Start development: npm run dev"
echo "  3. Open Prisma Studio: npm run studio:dev"
echo ""
echo "🔗 Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run test         - Run tests"
echo "  npm run lint         - Check code quality"
echo "  npm run format       - Format code"
echo "  npm run build        - Build for production"
echo ""
