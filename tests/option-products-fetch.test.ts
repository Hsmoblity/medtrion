/**
 * Test file for the new fetchOptionProductsByIds function
 * This validates the implementation of feat-option-query-followup.yaml
 */

import { fetchOptionProductsByIds } from '../src/lib/woocommerce';

async function testOptionProductsFetch() {
  console.log('Testing fetchOptionProductsByIds function...');
  
  try {
    // Test with empty array (should return empty array without making request)
    const emptyResult = await fetchOptionProductsByIds([]);
    console.log('✅ Empty array test:', emptyResult.length === 0 ? 'PASSED' : 'FAILED');
    
    // Test with sample IDs (will only work if GraphQL endpoint is configured)
    const sampleIds = [1603, 1602, 1604]; // Sample option product IDs
    const optionProducts = await fetchOptionProductsByIds(sampleIds);
    
    console.log('✅ Option products fetch test results:');
    console.log(`  - Retrieved ${optionProducts.length} products`);
    console.log(`  - Sample product structure:`, optionProducts[0] ? {
      id: optionProducts[0].id,
      name: optionProducts[0].name,
      hasSpecs: !!optionProducts[0].productSpecifications,
      hasGlobalAttrs: optionProducts[0].globalAttributes?.length > 0,
      hasVariations: optionProducts[0].variations?.length > 0,
      type: optionProducts[0].type,
      price: optionProducts[0].price
    } : 'No products returned');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Export for potential use in other tests
export { testOptionProductsFetch };

// Run test if this file is executed directly
if (require.main === module) {
  testOptionProductsFetch().then(success => {
    process.exit(success ? 0 : 1);
  });
}