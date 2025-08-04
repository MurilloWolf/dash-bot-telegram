#!/bin/bash

# 🌍 Environment Setup Script
# This script helps configure API endpoints for different environments

set -e

echo "🌍 API Environment Configuration"
echo "================================"

# Check current environment
if [ -f ".env.development" ]; then
    echo "📝 Development configuration found:"
    grep "API_BASE_URL" .env.development || echo "❌ API_BASE_URL not found in .env.development"
fi

echo ""
echo "🚀 Production configuration (fly.toml):"
grep "API_BASE_URL" fly.toml || echo "❌ API_BASE_URL not found in fly.toml"

echo ""
echo "📋 Current production endpoint: https://dash-bot-api.fly.dev/api"
echo ""

# Verify fly.io secrets if fly CLI is available
if command -v fly &> /dev/null; then
    echo "🔍 Checking fly.io configuration..."
    
    # Check if logged in
    if fly auth whoami &> /dev/null; then
        echo "✅ Logged in to fly.io"
        
        # Check app status
        if fly status &> /dev/null; then
            echo "✅ App 'dash-bot-telegram' found"
            
            echo ""
            echo "📊 Current environment variables in fly.io:"
            fly config show | grep -A 10 "\[env\]" || echo "❌ No [env] section found"
            
            echo ""
            echo "🔐 Available secrets (names only):"
            fly secrets list || echo "❌ Could not list secrets"
        else
            echo "⚠️  App 'dash-bot-telegram' not found or not accessible"
        fi
    else
        echo "⚠️  Not logged in to fly.io. Run 'fly auth login' first."
    fi
else
    echo "⚠️  Fly CLI not installed. Install with: brew install flyctl"
fi

echo ""
echo "✅ API endpoint configuration complete!"
echo "📍 Production endpoint: https://dash-bot-api.fly.dev/api"
echo "📍 Development endpoint: http://localhost:4000/api"
echo ""
echo "💡 To deploy with the new configuration:"
echo "   npm run deploy"
echo ""
echo "💡 To test the API connection:"
echo "   curl -v https://dash-bot-api.fly.dev/api/health"
