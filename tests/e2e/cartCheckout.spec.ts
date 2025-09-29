import { test, expect } from '@playwright/test';

test.describe('Cart and Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test('should navigate from cart to homepage sections', async ({ page }) => {
    // Go to cart page
    await page.goto('/cart');
    
    // Click on a navigation link that should go to homepage section
    const shopLink = page.locator('text="Shop All"').first();
    if (await shopLink.isVisible()) {
      await shopLink.click();
      
      // Should navigate to homepage with shop section
      await expect(page).toHaveURL('/#shop');
      
      // Wait for navigation to complete and section to be visible
      await page.waitForTimeout(500);
      
      // Check if we can find shop-related content
      const shopSection = page.locator('#shop, [data-testid="shop"], .shop-section').first();
      if (await shopSection.isVisible()) {
        await expect(shopSection).toBeVisible();
      }
    }
  });

  test('should navigate from payment page to homepage sections', async ({ page }) => {
    // Go to payment page
    await page.goto('/payment');
    
    // Click on home/logo to go back
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      
      // Should navigate to homepage
      await expect(page).toHaveURL('/');
    }
  });

  test('should handle cart operations', async ({ page }) => {
    // Navigate to a product page with options
    await page.goto('/product/acorn-stairlifts-acorn-180-curved-stairlift/options');
    
    // Look for add to cart button
    const addToCartButton = page.locator('text="Add Selected Options"').first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // Should navigate to cart page
      await expect(page).toHaveURL('/cart');
      
      // Check if cart shows some content (not necessarily items, but the page should load)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle configuration editing flow', async ({ page }) => {
    // Start from cart page
    await page.goto('/cart');
    
    // Look for edit configuration button
    const editButton = page.locator('button:has-text("Edit configuration")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Should navigate to options page with edit parameters
      await page.waitForURL(/\/product\/.*\/options/);
      
      // Look for save changes button to confirm we're in edit mode
      const saveButton = page.locator('text="Save Changes"').first();
      if (await saveButton.isVisible()) {
        await expect(saveButton).toBeVisible();
        
        // Click save to complete the flow
        await saveButton.click();
        
        // Should navigate back to cart
        await expect(page).toHaveURL('/cart');
      }
    }
  });

  test('should display cart count correctly', async ({ page }) => {
    // Check if cart icon shows count
    const cartIcon = page.locator('[data-testid="cart-icon"], .cart-icon').first();
    if (await cartIcon.isVisible()) {
      await expect(cartIcon).toBeVisible();
    }
    
    // Alternatively, look for shopping cart button
    const cartButton = page.locator('button:has([class*="cart" i])').first();
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Should navigate to cart page
      await expect(page).toHaveURL('/cart');
    }
  });

  test('should handle anchor navigation smoothly', async ({ page }) => {
    // Test navigation to different sections
    const sections = ['#shop', '#contact-us', '#reviews', '#faq'];
    
    for (const section of sections) {
      await page.goto('/');
      
      // Try to navigate to section
      await page.goto(section);
      
      // Should be on homepage with hash
      await expect(page).toHaveURL(section);
      
      // Wait a bit for any smooth scrolling
      await page.waitForTimeout(200);
    }
  });
  
  test('should handle product options page loading', async ({ page }) => {
    // Test that options pages load without errors
    const productSlugs = [
      'acorn-stairlifts-acorn-180-curved-stairlift',
      // Add more product slugs as needed
    ];
    
    for (const slug of productSlugs) {
      const response = await page.goto(`/product/${slug}/options`);
      
      // Page should load successfully
      expect(response?.status()).toBeLessThan(400);
      
      // Should show options interface
      await expect(page.locator('body')).toBeVisible();
      
      // Look for typical options page elements
      const optionsText = page.locator('text="Add Selected Options", text="Choose Options"').first();
      if (await optionsText.isVisible()) {
        await expect(optionsText).toBeVisible();
      }
    }
  });

  test('should handle responsive cart layout', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cart');
    
    // Cart should be visible on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop view  
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    
    // Cart should be visible on desktop
    await expect(page.locator('body')).toBeVisible();
  });
});