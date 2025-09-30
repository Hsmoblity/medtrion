#!/bin/bash

echo "🔍 STATE MANAGEMENT COMPLIANCE VERIFICATION"
echo "============================================"
echo ""

echo "📊 1. Checking for duplicate store calls..."
echo ""

# Check for multiple useConfiguratorStore calls in same file
echo "🔍 Duplicate useConfiguratorStore calls:"
for file in $(find src -name "*.tsx" -o -name "*.ts" | grep -v test); do
  count=$(grep -c "useConfiguratorStore()" "$file" 2>/dev/null || echo 0)
  if [ "$count" -gt 1 ]; then
    echo "❌ $file has $count useConfiguratorStore() calls"
  fi
done

# Check for multiple useCartStore calls in same file
echo ""
echo "🔍 Duplicate useCartStore calls:"
for file in $(find src -name "*.tsx" -o -name "*.ts" | grep -v test); do
  count=$(grep -c "useCartStore()" "$file" 2>/dev/null || echo 0)
  if [ "$count" -gt 1 ]; then
    echo "❌ $file has $count useCartStore() calls"
  fi
done

echo ""
echo "📊 2. Checking for potential duplicate state..."
echo ""

# Check for useState patterns that might duplicate store state
echo "🔍 Potential duplicate state patterns:"
grep -r "useState.*categories\|useState.*selectedOptions\|useState.*items\|useState.*cart" src/components/ src/pages/ --include="*.tsx" 2>/dev/null | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  # Check if this file also uses a store
  if grep -q "useConfiguratorStore\|useCartStore" "$file" 2>/dev/null; then
    echo "⚠️  $line"
    echo "   ↳ File also uses global store - verify no duplication"
  fi
done

echo ""
echo "📊 3. Checking store usage patterns..."
echo ""

echo "✅ Components using configuratorStore:"
grep -l "useConfiguratorStore" src/components/* src/pages/* 2>/dev/null | head -10

echo ""
echo "✅ Components using cartStore:"
grep -l "useCartStore" src/components/* src/pages/* 2>/dev/null | head -10

echo ""
echo "📊 4. Verifying key components..."
echo ""

# Check ModelConfigurator specifically
if [ -f "src/components/configurator/ModelConfigurator.tsx" ]; then
  echo "🔍 ModelConfigurator.tsx:"
  store_calls=$(grep -c "useConfiguratorStore()" "src/components/configurator/ModelConfigurator.tsx" 2>/dev/null || echo 0)
  if [ "$store_calls" -eq 1 ]; then
    echo "  ✅ Single store call"
  else
    echo "  ❌ $store_calls store calls (should be 1)"
  fi
  
  # Check for local state that might duplicate store state
  if grep -q "useState.*categories\|useState.*selectedOptions\|useState.*compatibilityIssues" "src/components/configurator/ModelConfigurator.tsx" 2>/dev/null; then
    echo "  ⚠️  May have duplicate state - needs manual verification"
  else
    echo "  ✅ No obvious duplicate state patterns"
  fi
fi

# Check OptionCard
if [ -f "src/components/configurator/OptionCard.tsx" ]; then
  echo ""
  echo "🔍 OptionCard.tsx:"
  store_calls=$(grep -c "useConfiguratorStore()" "src/components/configurator/OptionCard.tsx" 2>/dev/null || echo 0)
  if [ "$store_calls" -eq 1 ]; then
    echo "  ✅ Single store call"
  else
    echo "  ❌ $store_calls store calls (should be 1)"
  fi
fi

# Check Cart components
echo ""
echo "🔍 Cart components:"
for file in src/components/PageLayout/Cart/*.tsx src/pages/cart.tsx; do
  if [ -f "$file" ]; then
    store_calls=$(grep -c "useCartStore" "$file" 2>/dev/null || echo 0)
    if [ "$store_calls" -gt 0 ]; then
      echo "  ✅ $(basename "$file"): Uses cart store"
    fi
  fi
done

echo ""
echo "📊 5. Final compliance check..."
echo ""

# Count total violations
violations=0

# Check for .getState() calls (potential violations)
getstate_calls=$(grep -r "\.getState()" src/components/ src/pages/ --include="*.tsx" 2>/dev/null | wc -l)
if [ "$getstate_calls" -gt 0 ]; then
  echo "⚠️  Found $getstate_calls .getState() calls - verify these are necessary"
  violations=$((violations + 1))
fi

# Check for legacy context imports
legacy_context=$(grep -r "CartItemsContext\|useCartItemsContext" src/components/ src/pages/ --include="*.tsx" 2>/dev/null | wc -l)
if [ "$legacy_context" -gt 0 ]; then
  echo "⚠️  Found $legacy_context legacy context references"
  violations=$((violations + 1))
fi

echo ""
if [ "$violations" -eq 0 ]; then
  echo "🎉 STATE MANAGEMENT COMPLIANCE: PASSED"
  echo "✅ No critical violations detected"
else
  echo "⚠️  STATE MANAGEMENT COMPLIANCE: NEEDS REVIEW"
  echo "❌ $violations potential issues found"
fi

echo ""
echo "============================================"
echo "🏁 Verification Complete"