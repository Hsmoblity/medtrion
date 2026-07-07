#!/usr/bin/env node

/**
 * Navigation fix verification script
 * This script checks that all navigation components have been updated correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧭 Testing navigation fix implementation...\n');

const filesToCheck = [
  {
    file: 'src/components/PageLayout/Header.tsx',
    checks: [
      { pattern: /handleAnchorNavigation/, description: 'Uses handleAnchorNavigation function' },
      { pattern: /useRouter.*next\/router/, description: 'Imports useRouter from next/router' },
      { pattern: /onClick=.*handleAnchorNavigation/, description: 'Button onClick handlers use navigation utility' }
    ]
  },
  {
    file: 'src/components/banner.tsx',
    checks: [
      { pattern: /handleAnchorNavigation/, description: 'Uses handleAnchorNavigation function' },
      { pattern: /useRouter/, description: 'Uses useRouter hook' },
      { pattern: /onClick=.*handleAnchorNavigation.*\/#shop/, description: 'CTA button navigates to /#shop' }
    ]
  },
  {
    file: 'src/components/hero.tsx',
    checks: [
      { pattern: /handleAnchorNavigation/, description: 'Uses handleAnchorNavigation function' },
      { pattern: /useRouter/, description: 'Uses useRouter hook' },
      { pattern: /onClick=.*handleAnchorNavigation.*\/#reviews/, description: 'Learn more button navigates to /#reviews' }
    ]
  },
  {
    file: 'src/components/drawer.tsx',
    checks: [
      { pattern: /handleAnchorNavigation/, description: 'Uses handleAnchorNavigation function' },
      { pattern: /useRouter/, description: 'Uses useRouter hook' },
      { pattern: /button.*onClick.*Shop All/, description: 'Shop All uses button with onClick' },
      { pattern: /button.*onClick.*Reviews/, description: 'Reviews uses button with onClick' }
    ]
  },
  {
    file: 'src/components/PageLayout/Footer.tsx',
    checks: [
      { pattern: /handleAnchorNavigation/, description: 'Uses handleAnchorNavigation function' },
      { pattern: /useRouter/, description: 'Uses useRouter hook' },
      { pattern: /button.*onClick.*Shop All/, description: 'Shop All uses button with onClick' }
    ]
  },
  {
    file: 'src/lib/utils/navigation.ts',
    checks: [
      { pattern: /export.*useAnchorNavigation/, description: 'Exports useAnchorNavigation hook' },
      { pattern: /export.*handleAnchorNavigation/, description: 'Exports handleAnchorNavigation function' },
      { pattern: /scrollIntoView.*smooth/, description: 'Uses smooth scrolling' },
      { pattern: /router\.push/, description: 'Uses Next.js router for navigation' }
    ]
  }
];

let totalTests = 0;
let passedTests = 0;

filesToCheck.forEach(({ file, checks }) => {
  const filePath = path.join(__dirname, '..', file);
  
  console.log(`📁 Checking ${file}:`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File does not exist\n`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  checks.forEach(({ pattern, description }) => {
    totalTests++;
    const matches = pattern.test(content);
    
    if (matches) {
      console.log(`   ✅ ${description}`);
      passedTests++;
    } else {
      console.log(`   ❌ ${description}`);
    }
  });
  
  console.log('');
});

// Summary
console.log('📊 Test Summary:');
console.log(`   Total Tests: ${totalTests}`);
console.log(`   Passed: ${passedTests}`);
console.log(`   Failed: ${totalTests - passedTests}`);
console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%\n`);

if (passedTests === totalTests) {
  console.log('🎉 All navigation fix tests passed!');
  console.log('✅ Navigation components updated successfully');
  console.log('✅ Cross-page anchor navigation should now work correctly');
  console.log('✅ Users can navigate from any page to homepage sections\n');
  
  console.log('🧪 Manual Testing Steps:');
  console.log('1. Navigate to /cart page');
  console.log('2. Use NavigationTest component to test navigation');
  console.log('3. Click header navigation items from various pages');
  console.log('4. Verify banner and hero CTAs work from non-home pages');
  console.log('5. Test mobile drawer navigation');
  console.log('6. Check footer quick links functionality\n');
  
  console.log('🧹 Cleanup after testing:');
  console.log('- Remove NavigationTest component from cart.tsx');
  console.log('- Remove debug components from pages');
  console.log('- Deploy to production');
} else {
  console.log('❌ Some navigation fix tests failed');
  console.log('Please review the failed checks and fix the issues');
  process.exit(1);
}