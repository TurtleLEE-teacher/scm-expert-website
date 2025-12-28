#!/bin/bash
echo "🔍 Checking recent commits for workflow updates..."
echo ""

# Check if there are any workflow run logs committed
if [ -d ".github/workflows" ]; then
    echo "✓ Workflows directory found"
    ls -la .github/workflows/*.yml
fi

echo ""
echo "📋 Recent commits related to Notion data:"
git log --oneline --all --grep="Notion\|review\|별점" -10

echo ""
echo "💡 To see actual workflow logs, run:"
echo "   gh run list --workflow='Update Notion Data'"
echo "   gh run view <run-id> --log"
