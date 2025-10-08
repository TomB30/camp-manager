#!/bin/bash

# Helper script to check deployment status
# Usage: bash .github/check-deployment.sh YOUR_USERNAME

USERNAME=${1:-"YOUR_USERNAME"}

echo "🔍 Checking deployment status for $USERNAME/camp-manager"
echo ""
echo "📍 Check these URLs:"
echo ""
echo "1. Actions page (workflow status):"
echo "   https://github.com/$USERNAME/camp-manager/actions"
echo ""
echo "2. GitHub Pages settings:"
echo "   https://github.com/$USERNAME/camp-manager/settings/pages"
echo ""
echo "3. Your live site (after deployment):"
echo "   https://$USERNAME.github.io/camp-manager/"
echo ""
echo "💡 Tip: First push triggers the workflow automatically"
echo "   Look for a yellow dot → green checkmark in the Actions tab"
echo ""


