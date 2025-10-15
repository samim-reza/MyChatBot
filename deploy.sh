#!/bin/bash
# Quick deployment preparation script

echo "🚀 Preparing for Azure deployment..."

# Check if git repo exists
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git remote add origin https://github.com/samim-reza/MyChatBot.git"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Make sure to set environment variables in Azure!"
fi

# Stage all changes
echo "📦 Staging files..."
git add .

# Show status
echo "📋 Files to be committed:"
git status --short

# Commit
echo ""
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Prepare for Azure deployment"
fi

git commit -m "$commit_msg"

# Push
echo ""
echo "🔄 Pushing to GitHub..."
git push origin master

echo ""
echo "✅ Done! Your code is now on GitHub."
echo ""
echo "📚 Next steps:"
echo "1. Follow instructions in AZURE_DEPLOYMENT.md"
echo "2. Go to https://portal.azure.com"
echo "3. Create a Web App and connect to GitHub"
echo "4. Don't forget to set environment variables in Azure!"
echo ""
echo "Environment variables needed:"
echo "  - GROQ_API_KEY"
echo "  - PINECONE_API_KEY"
echo "  - PINECONE_INDEX_NAME"
