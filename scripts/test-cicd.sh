#!/bin/bash

# 🧪 CI/CD Testing Script
# This script helps you test and validate your CI/CD pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 CI/CD Pipeline Testing"
echo "========================="

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ GitHub CLI not found${NC}"
        echo "Install with: brew install gh"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found${NC}"
        echo "Install Node.js first"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Requirements check complete${NC}"
}

# Test 1: Check GitHub Actions status
test_github_actions() {
    echo ""
    echo "📊 Test 1: GitHub Actions Status"
    echo "================================"
    
    echo "🔍 Recent workflow runs:"
    gh run list --limit 10
    
    echo ""
    echo "❌ Failed runs:"
    gh run list --status failure --limit 5
    
    echo ""
    echo "✅ Successful runs:"
    gh run list --status success --limit 5
}

# Test 2: Local code quality checks
test_local_quality() {
    echo ""
    echo "🔍 Test 2: Local Code Quality"
    echo "============================="
    
    echo "📦 Installing dependencies..."
    npm ci
    
    echo ""
    echo "🔍 Running ESLint..."
    if npm run lint; then
        echo -e "${GREEN}✅ ESLint passed${NC}"
    else
        echo -e "${RED}❌ ESLint failed${NC}"
        echo "Run 'npm run lint:fix' to fix issues"
    fi
    
    echo ""
    echo "💅 Checking Prettier formatting..."
    if npm run format:check; then
        echo -e "${GREEN}✅ Prettier formatting is correct${NC}"
    else
        echo -e "${RED}❌ Prettier formatting issues found${NC}"
        echo "Run 'npm run format' to fix formatting"
    fi
    
    echo ""
    echo "🧪 Running tests..."
    if npm test; then
        echo -e "${GREEN}✅ Tests passed${NC}"
    else
        echo -e "${RED}❌ Tests failed${NC}"
    fi
    
    echo ""
    echo "🏗️ Testing build..."
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
    fi
}

# Test 3: Check secrets configuration
test_secrets() {
    echo ""
    echo "🔐 Test 3: Secrets Configuration"
    echo "================================"
    
    echo "🔍 Checking GitHub secrets..."
    if gh secret list | grep -q "FLY_API_TOKEN"; then
        echo -e "${GREEN}✅ FLY_API_TOKEN configured${NC}"
    else
        echo -e "${RED}❌ FLY_API_TOKEN not found${NC}"
        echo "Run './scripts/setup-secrets.sh' to configure"
    fi
    
    echo ""
    echo "🔍 Checking Fly.io authentication..."
    if command -v fly &> /dev/null; then
        if fly auth whoami &> /dev/null; then
            echo -e "${GREEN}✅ Logged in to Fly.io as: $(fly auth whoami)${NC}"
            
            echo ""
            echo "🔍 Checking Fly.io app..."
            if [ -f "fly.toml" ]; then
                APP_NAME=$(grep "app = " fly.toml | cut -d'"' -f2)
                echo -e "${GREEN}✅ Fly.io app found: ${APP_NAME}${NC}"
                
                echo ""
                echo "🔍 Checking Fly.io secrets..."
                fly secrets list
            else
                echo -e "${YELLOW}⚠️  fly.toml not found${NC}"
            fi
        else
            echo -e "${RED}❌ Not logged in to Fly.io${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Fly CLI not installed${NC}"
    fi
}

# Test 4: Create test PR
test_pr_workflow() {
    echo ""
    echo "🔄 Test 4: Pull Request Workflow"
    echo "================================"
    
    echo "Do you want to create a test PR to validate the full pipeline? (y/n)"
    read -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌿 Creating test branch..."
        
        # Create a test branch
        BRANCH_NAME="test/ci-cd-$(date +%s)"
        git checkout -b "$BRANCH_NAME"
        
        # Make a small change
        echo "# CI/CD Test $(date)" >> test-ci-cd.md
        git add test-ci-cd.md
        git commit -m "test: validate CI/CD pipeline functionality"
        
        # Push branch
        git push origin "$BRANCH_NAME"
        
        # Create PR
        gh pr create \
            --title "🧪 Test: CI/CD Pipeline Validation" \
            --body "This is a test PR to validate the CI/CD pipeline functionality. It should trigger all workflows and demonstrate the automation." \
            --label "test" \
            --assignee "@me"
        
        echo -e "${GREEN}✅ Test PR created${NC}"
        echo "Monitor the PR to see workflows in action"
        
        # Show PR URL
        gh pr view --web
    else
        echo "⏭️  Skipping test PR creation"
    fi
}

# Test 5: Validate workflow files
test_workflow_files() {
    echo ""
    echo "📋 Test 5: Workflow Files Validation"
    echo "===================================="
    
    WORKFLOW_DIR=".github/workflows"
    
    if [ -d "$WORKFLOW_DIR" ]; then
        echo "✅ Workflow directory exists"
        
        echo ""
        echo "📁 Workflow files found:"
        ls -la "$WORKFLOW_DIR"/*.yml 2>/dev/null || echo "No .yml files found"
        
        echo ""
        echo "🔍 Validating syntax..."
        for file in "$WORKFLOW_DIR"/*.yml; do
            if [ -f "$file" ]; then
                echo "  Checking $(basename "$file")..."
                # Basic YAML syntax check using Python
                python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null && \
                    echo -e "    ${GREEN}✅ Valid YAML${NC}" || \
                    echo -e "    ${RED}❌ Invalid YAML${NC}"
            fi
        done
    else
        echo -e "${RED}❌ .github/workflows directory not found${NC}"
    fi
}

# Generate test report
generate_report() {
    echo ""
    echo "📊 CI/CD Test Report"
    echo "==================="
    
    echo "🕐 Test completed at: $(date)"
    echo ""
    
    echo "📋 Summary:"
    echo "- GitHub Actions: Check workflow runs above"
    echo "- Local Quality: Run individual tests to verify"
    echo "- Secrets: Verify FLY_API_TOKEN and Fly.io setup"
    echo "- Workflow Files: Check syntax validation above"
    
    echo ""
    echo "🔗 Useful Commands:"
    echo "  gh run list              # View recent workflow runs"
    echo "  gh run view <run-id>     # View specific run details"
    echo "  npm run lint            # Run ESLint locally"
    echo "  npm run format          # Format code with Prettier"
    echo "  npm test                # Run tests locally"
    echo "  npm run build           # Test build locally"
    echo ""
    
    echo "📚 Documentation:"
    echo "  docs/setup-secrets.md   # Secret configuration guide"
    echo "  docs/setup-quick.md     # Quick setup guide"
    echo ""
}

# Main execution
main() {
    echo "This script will test your CI/CD pipeline configuration"
    echo "Make sure you're in the project root directory"
    echo ""
    
    check_requirements
    test_github_actions
    test_local_quality
    test_secrets
    test_workflow_files
    test_pr_workflow
    generate_report
    
    echo ""
    echo -e "${GREEN}🎉 CI/CD testing complete!${NC}"
    echo "Check the results above and fix any issues found."
}

# Run main function
main
