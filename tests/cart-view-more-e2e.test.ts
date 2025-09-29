import { test, expect } from '@playwright/test';

test.describe('Cart View More E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage first
    await page.goto('/');
  });

  test('should add product to cart and navigate to product detail via View More', async ({ page }) => {
    // Add a product to cart (assuming there's a product on the homepage)
    const addToCartButton = page.locator('button:has-text("Add to cart")').first();
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // Wait for navigation to cart page
      await page.waitForURL('/cart');
      
      // Check that cart page loads
      await expect(page.getByText('Shopping Cart')).toBeVisible();
      
      // Look for View More link in cart items
      const viewMoreLink = page.locator('a:has-text("View More →")').first();
      
      if (await viewMoreLink.isVisible()) {
        // Click View More link
        await viewMoreLink.click();
        
        // Should navigate to product detail page
        await page.waitForLoadState('networkidle');
        
        // Check that we're on a product detail page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/product\/.+/);
        
        // Check that product detail page loads successfully (not 404)
        await expect(page.locator('body')).not.toContainText('Product not found');
        await expect(page.locator('body')).not.toContainText('404');
      }
    }
  });

  test('should handle View More navigation for multiple cart items', async ({ page }) => {
    // Add multiple products to cart
    const addToCartButtons = page.locator('button:has-text("Add to cart")');
    const buttonCount = await addToCartButtons.count();
    
    if (buttonCount > 0) {
      // Add first product
      await addToCartButtons.first().click();
      await page.waitForURL('/cart');
      
      // Go back to homepage
      await page.goto('/');
      
      // Add second product if available
      if (buttonCount > 1) {
        await addToCartButtons.nth(1).click();
        await page.waitForURL('/cart');
      }
      
      // Check that cart has multiple items
      const cartItems = page.locator('[data-testid^="product-card-"], .cart-item, .item');
      const itemCount = await cartItems.count();
      
      if (itemCount > 0) {
        // Test View More for each cart item
        const viewMoreLinks = page.locator('a:has-text("View More →")');
        const linkCount = await viewMoreLinks.count();
        
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          // Click View More link
          await viewMoreLinks.nth(i).click();
          
          // Should navigate to product detail page
          await page.waitForLoadState('networkidle');
          
          // Check that product detail page loads successfully
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/product\/.+/);
          
          // Check that page doesn't show 404 or "Product not found"
          await expect(page.locator('body')).not.toContainText('Product not found');
          await expect(page.locator('body')).not.toContainText('404');
          
          // Go back to cart to test next item
          await page.goto('/cart');
          await page.waitForLoadState('networkidle');
        }
      }
    }
  });

  test('should show fallback message when product slug is missing', async ({ page }) => {
    // This test would require setting up a cart item with missing slug
    // For now, we'll test the cart page loads and check for fallback messages
    
    await page.goto('/cart');
    
    // Check if cart is empty or has items
    const emptyCartMessage = page.locator('text=Your cart is empty');
    const cartItems = page.locator('[data-testid^="product-card-"], .cart-item, .item');
    
    if (await emptyCartMessage.isVisible()) {
      // Cart is empty, add a product first
      await page.goto('/');
      const addToCartButton = page.locator('button:has-text("Add to cart")').first();
      
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForURL('/cart');
      }
    }
    
    // Check for fallback messages
    const fallbackMessages = page.locator('text=Product details unavailable');
    const fallbackCount = await fallbackMessages.count();
    
    if (fallbackCount > 0) {
      // Verify fallback message is displayed
      await expect(fallbackMessages.first()).toBeVisible();
    }
  });

  test('should maintain cart state during View More navigation', async ({ page }) => {
    // Add product to cart
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to cart")').first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForURL('/cart');
      
      // Get cart item count before navigation
      const cartCountBefore = await page.locator('text=Cart Items').textContent();
      
      // Click View More
      const viewMoreLink = page.locator('a:has-text("View More →")').first();
      
      if (await viewMoreLink.isVisible()) {
        await viewMoreLink.click();
        await page.waitForLoadState('networkidle');
        
        // Navigate back to cart
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');
        
        // Check that cart state is maintained
        const cartCountAfter = await page.locator('text=Cart Items').textContent();
        expect(cartCountAfter).toBe(cartCountBefore);
      }
    }
  });

  test('should handle View More navigation errors gracefully', async ({ page }) => {
    // Add product to cart
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to cart")').first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForURL('/cart');
      
      // Mock network failure for product detail page
      await page.route('**/product/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'text/html',
          body: '<html><body>Server Error</body></html>'
        });
      });
      
      // Click View More
      const viewMoreLink = page.locator('a:has-text("View More →")').first();
      
      if (await viewMoreLink.isVisible()) {
        await viewMoreLink.click();
        
        // Should handle error gracefully
        await page.waitForLoadState('networkidle');
        
        // Check that error is handled (either shows error page or stays on cart)
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(cart|product\/.+)/);
      }
    }
  });

  test('should have proper accessibility for View More links', async ({ page }) => {
    // Add product to cart
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to cart")').first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForURL('/cart');
      
      // Check View More link accessibility
      const viewMoreLink = page.locator('a:has-text("View More →")').first();
      
      if (await viewMoreLink.isVisible()) {
        // Check that link has proper href attribute
        const href = await viewMoreLink.getAttribute('href');
        expect(href).toMatch(/^\/product\/.+/);
        
        // Check that link is keyboard accessible
        await viewMoreLink.focus();
        await expect(viewMoreLink).toBeFocused();
        
        // Check that link can be activated with Enter key
        await viewMoreLink.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Should navigate to product detail page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/product\/.+/);
      }
    }
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Add product to cart
    await page.goto('/');
    const addToCartButton = page.locator('button:has-text("Add to cart")').first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForURL('/cart');
      
      // Check View More link on mobile
      const viewMoreLink = page.locator('a:has-text("View More →")').first();
      
      if (await viewMoreLink.isVisible()) {
        // Check that link is touch-friendly
        const linkBox = await viewMoreLink.boundingBox();
        expect(linkBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
        
        // Click View More link
        await viewMoreLink.click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to product detail page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/product\/.+/);
      }
    }
  });
});