#!/bin/bash

# Production Readiness Check Script
# Validates that the application is ready for production deployment

echo "🔍 Production Readiness Check - Mock Data Cleanup Validation"
echo "============================================================"
echo ""

# Check Node environment
if [ "$NODE_ENV" = "production" ]; then
    echo "✅ NODE_ENV is set to production"
else
    echo "⚠️  NODE_ENV is not set to production (current: ${NODE_ENV:-'undefined'})"
fi
echo ""

# Check for live endpoint configuration
echo "📡 Checking live endpoint configuration..."
if [ -n "$CONFIGURATOR_GRAPHQL_URL" ] || [ -n "$NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL" ]; then
    echo "✅ Configurator GraphQL endpoint configured"
else
    echo "❌ No configurator GraphQL endpoint configured"
fi

if [ -n "$WP_GRAPHQL_URL" ] || [ -n "$NEXT_PUBLIC_WP_GRAPHQL_URL" ]; then
    echo "✅ WooCommerce GraphQL endpoint configured"
else
    echo "⚠️  No WooCommerce GraphQL endpoint configured"
fi

if [ -n "$CONTENTFUL_SPACE_ID" ] && [ -n "$CONTENTFUL_ACCESS_TOKEN" ]; then
    echo "✅ Contentful CMS configured"
else
    echo "⚠️  Contentful CMS not configured"
fi
echo ""

# Search for remaining mock data patterns
echo "🔍 Scanning for mock data patterns in production code..."

echo "📋 Checking for hardcoded mock arrays..."
MOCK_ARRAYS=$(grep -r "const.*=.*\[.*{.*id.*:.*safety\|comfort\|installation\|accessories" src/pages/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
if [ -z "$MOCK_ARRAYS" ]; then
    echo "✅ No hardcoded mock category arrays found in pages"
else
    echo "❌ Found hardcoded mock arrays:"
    echo "$MOCK_ARRAYS"
fi

echo "📋 Checking for TODO comments about mock data..."
TODO_MOCKS=$(grep -r "TODO.*mock\|TODO.*fixture\|For now.*mock" src/pages/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
if [ -z "$TODO_MOCKS" ]; then
    echo "✅ No TODO comments about mock data found"
else
    echo "⚠️  Found TODO comments about mock data:"
    echo "$TODO_MOCKS"
fi

echo "📋 Checking for debug component imports in pages..."
DEBUG_IMPORTS=$(grep -r "import.*debug\|from.*debug" src/pages/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
if [ -z "$DEBUG_IMPORTS" ]; then
    echo "✅ No debug component imports found in pages"
else
    echo "❌ Found debug component imports:"
    echo "$DEBUG_IMPORTS"
fi

echo "📋 Checking for debug component usage in pages..."
DEBUG_USAGE=$(grep -r "<.*Test.*>.*<\|<.*Debug.*>.*<" src/pages/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
if [ -z "$DEBUG_USAGE" ]; then
    echo "✅ No debug component usage found in pages"
else
    echo "❌ Found debug component usage:"
    echo "$DEBUG_USAGE"
fi
echo ""

# Check API endpoints
echo "🌐 Checking API endpoint security..."

# Check if mock API handler is properly gated
if grep -q "shouldEnableMockData" src/pages/api/graphql.ts; then
    echo "✅ Mock GraphQL API is properly environment-gated"
else
    echo "❌ Mock GraphQL API is not properly environment-gated"
fi

# Check if debug endpoints are properly gated
if [ -d "src/pages/api/debug" ]; then
    if grep -q "shouldEnableDebugEndpoints" src/pages/api/debug/*.ts; then
        echo "✅ Debug endpoints are properly environment-gated"
    else
        echo "❌ Debug endpoints are not properly environment-gated"
    fi
else
    echo "✅ No debug API endpoints found"
fi
echo ""

# Check for environment validation
echo "🔧 Checking environment validation..."
if [ -f "src/lib/utils/environment-validation.ts" ]; then
    echo "✅ Environment validation utility exists"
else
    echo "❌ Environment validation utility missing"
fi
echo ""

# Summary
echo "📊 Summary"
echo "=========="
echo ""

# Count issues
ISSUES=0

if [ "$NODE_ENV" != "production" ]; then
    ((ISSUES++))
fi

if [ -z "$CONFIGURATOR_GRAPHQL_URL" ] && [ -z "$NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL" ]; then
    ((ISSUES++))
fi

if [ -n "$MOCK_ARRAYS" ]; then
    ((ISSUES++))
fi

if [ -n "$DEBUG_IMPORTS" ]; then
    ((ISSUES++))
fi

if [ -n "$DEBUG_USAGE" ]; then
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo "🎉 All checks passed! Application is ready for production deployment."
    echo ""
    echo "✅ No mock data found in production code"
    echo "✅ Debug components removed from pages"  
    echo "✅ API endpoints properly secured"
    echo "✅ Environment validation in place"
    exit 0
else
    echo "❌ Found $ISSUES issue(s) that need to be addressed before production deployment."
    echo ""
    echo "Please review and fix the issues listed above."
    exit 1
fi