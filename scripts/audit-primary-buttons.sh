#!/bin/bash

# Primary Button Audit Script
# Helps find remaining instances of primary button patterns that should be refactored

echo "🔍 Scanning for primary button patterns that should use PrimaryButton component..."
echo ""

echo "📋 Raw bg-blue-600 patterns (should be migrated):"
grep -r "bg-blue-600.*hover:bg-blue-700" src/ --include="*.tsx" --include="*.ts" | grep -v PrimaryButton || echo "  ✅ None found"
echo ""

echo "📋 Inline button classes (potential candidates):"
grep -r "className.*bg-blue-600" src/ --include="*.tsx" --include="*.ts" | grep -v PrimaryButton || echo "  ✅ None found"
echo ""

echo "📋 Focus ring patterns (should use PrimaryButton):"
grep -r "focus:ring-blue-500" src/ --include="*.tsx" --include="*.ts" | grep -v PrimaryButton || echo "  ✅ None found"
echo ""

echo "📋 Button elements with primary styling:"
grep -r "<button.*bg-blue-600" src/ --include="*.tsx" --include="*.ts" | grep -v PrimaryButton || echo "  ✅ None found"
echo ""

echo "📋 Link elements with button styling:"
grep -r "<a.*bg-blue-600" src/ --include="*.tsx" --include="*.ts" | grep -v PrimaryButton || echo "  ✅ None found"
echo ""

echo "🎯 Recommendations:"
echo "  1. Replace any found patterns with <PrimaryButton>"
echo "  2. Use href prop for navigation links"
echo "  3. Use loading prop instead of custom spinners"
echo "  4. Use size='sm|md|lg' instead of custom padding"
echo ""

echo "📚 Reference: docs/ui-button-guidelines.md"