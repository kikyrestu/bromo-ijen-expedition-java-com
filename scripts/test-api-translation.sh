#!/bin/bash

echo "🧪 Testing Section Translation API..."
echo ""

BASE_URL="http://localhost:3000"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Testing whoAmI section in different languages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for lang in en de nl zh; do
  echo ""
  echo "🌐 Language: ${lang^^}"
  echo "────────────────────────────────────────────────────"
  
  response=$(curl -s "${BASE_URL}/api/sections?section=whoAmI&language=${lang}")
  
  # Extract title and description using jq if available
  if command -v jq &> /dev/null; then
    title=$(echo "$response" | jq -r '.data.title // "N/A"')
    desc=$(echo "$response" | jq -r '.data.description // "N/A"' | cut -c1-100)
    source=$(echo "$response" | jq -r '.source // "N/A"')
    has_desc=$(echo "$response" | jq -r '.debug.hasDescription // "N/A"')
    
    echo "  📌 Source: $source"
    echo "  📝 Title: $title"
    echo "  💬 Description: $desc..."
    echo "  ✓  Has Description: $has_desc"
  else
    echo "$response" | head -c 500
    echo "..."
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test complete!"
echo ""
echo "📋 What to check:"
echo "  1. Source should be 'database-translation' for all languages"
echo "  2. Description should be in the target language"
echo "  3. 'Has Description' should be 'true'"
echo ""
echo "🔧 If any test fails:"
echo "  - Check server is running (npm run dev)"
echo "  - Re-translate from CMS if needed"
echo "  - Clear browser cache"
echo ""
