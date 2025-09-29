import { test, expect } from '@playwright/test';

test.describe('Configurator View Details E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a product configurator page
    await page.goto('/product/acorn-stairlifts-acorn-180-curved-stairlift/configure');
  });

  test('should navigate to product detail page when View Details is clicked on configurator option', async ({ page }) => {
    // Wait for configurator to load
    await page.waitForLoadState('networkidle');
    
    // Check if configurator loaded successfully
    const configuratorContent = page.locator('[data-testid="configurator"], .configurator, .model-configurator');
    if (await configuratorContent.isVisible()) {
      // Look for category buttons or option cards
      const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Options"), .category-button');
      const optionCards = page.locator('.option-card, [data-testid*="option"]');
      
      if (await categoryButtons.count() > 0) {
        // Click on first category to show options
        await categoryButtons.first().click();
        await page.waitForTimeout(1000); // Wait for options to load
        
        // Look for View Details buttons
        const viewDetailsButtons = page.locator('button:has-text("View Details")');
        
        if (await viewDetailsButtons.count() > 0) {
          // Click first View Details button
          await viewDetailsButtons.first().click();
          
          // Should navigate to product detail page
          await page.waitForLoadState('networkidle');
          
          // Check that we're on a product detail page
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/product\/.+/);
          
          // Check that product detail page loads successfully (not 404)
          await expect(page.locator('body')).not.toContainText('Product not found');
          await expect(page.locator('body')).not.toContainText('404');
          
          // Check that product detail page has expected content
          await expect(page.locator('h1, h2')).toBeVisible();
        }
      } else if (await optionCards.count() > 0) {
        // If options are already visible, look for View Details buttons
        const viewDetailsButtons = page.locator('button:has-text("View Details")');
        
        if (await viewDetailsButtons.count() > 0) {
          // Click first View Details button
          await viewDetailsButtons.first().click();
          
          // Should navigate to product detail page
          await page.waitForLoadState('networkidle');
          
          // Check that we're on a product detail page
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/product\/.+/);
          
          // Check that product detail page loads successfully
          await expect(page.locator('body')).not.toContainText('Product not found');
          await expect(page.locator('body')).not.toContainText('404');
        }
      }
    }
  });

  test('should handle View Details navigation for multiple configurator options', async ({ page }) => {
    // Wait for configurator to load
    await page.waitForLoadState('networkidle');
    
    // Check if configurator loaded successfully
    const configuratorContent = page.locator('[data-testid="configurator"], .configurator, .model-configurator');
    if (await configuratorContent.isVisible()) {
      // Look for category buttons
      const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Options"), .category-button');
      
      if (await categoryButtons.count() > 0) {
        // Click on first category to show options
        await categoryButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Look for View Details buttons
        const viewDetailsButtons = page.locator('button:has-text("View Details")');
        const buttonCount = await viewDetailsButtons.count();
        
        if (buttonCount > 0) {
          // Test View Details for first few options
          for (let i = 0; i < Math.min(buttonCount, 3); i++) {
            // Click View Details button
            await viewDetailsButtons.nth(i).click();
            
            // Should navigate to product detail page
            await page.waitForLoadState('networkidle');
            
            // Check that product detail page loads successfully
            const currentUrl = page.url();
            expect(currentUrl).toMatch(/\/product\/.+/);
            
            // Check that page doesn't show 404 or "Product not found"
            await expect(page.locator('body')).not.toContainText('Product not found');
            await expect(page.locator('body')).not.toContainText('404');
            
            // Go back to configurator to test next option
            await page.goBack();
            await page.waitForLoadState('networkidle');
            
            // Re-click category to show options again
            await categoryButtons.first().click();
            await page.waitForTimeout(1000);
          }
        }
      }
    }
  });

  test('should maintain configurator state during View Details navigation', async ({ page }) => {
    // Wait for configurator to load
    await page.waitForLoadState('networkidle');
    
    // Check if configurator loaded successfully
    const configuratorContent = page.locator('[data-testid="configurator"], .configurator, .model-configurator');
    if (await configuratorContent.isVisible()) {
      // Look for category buttons
      const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Options"), .category-button');
      
      if (await categoryButtons.count() > 0) {
        // Click on first category to show options
        await categoryButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Look for View Details buttons
        const viewDetailsButtons = page.locator('button:has-text("View Details")');
        
        if (await viewDetailsButtons.count() > 0) {
          // Click View Details button
          await viewDetailsButtons.first().click();
          
          // Should navigate to product detail page
          await page.waitForLoadState('networkidle');
          
          // Go back to configurator
          await page.goBack();
          await page.waitForLoadState('networkidle');
          
          // Check that configurator is still functional
          const configuratorStillVisible = await configuratorContent.isVisible();
          expect(configuratorStillVisible).toBe(true);
        }
      }
    }
  });

  test('should handle View Details navigation errors gracefully', async ({ page }) => {
    // Wait for configurator to load
    await page.waitForLoadState('networkidle');
    
    // Check if configurator loaded successfully
    const configuratorContent = page.locator('[data-testid="configurator"], .configurator, .model-configurator');
    if (await configuratorContent.isVisible()) {
      // Look for category buttons
      const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Options"), .category-button');
      
      if (await categoryButtons.count() > 0) {
        // Click on first category to show options
        await categoryButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Look for View Details buttons
        const viewDetailsButtons = page.locator('button:has-text("View Details")');
        
        if (await viewDetailsButtons.count() > 0) {
          // Mock network failure for product detail page
          await page.route('**/product/**', route => {
            route.fulfill({
              status: 500,
              contentType: 'text/html',
              body: '<html><body>Server Error</body></html>'
            });
          });
          
          // Click View Details button
          await viewDetailsButtons.first().click();
          
          // Should handle error gracefully
          await page.waitForLoadState('networkidle');
          
          // Check that error is handled (either shows error page or stays on configurator)
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/(configure|product\/.+)/);
        }
      }
    }
  });

  test('should have proper accessibility for View Details buttons', async ({ page }) => {
    // Wait for configurator to load
    await page.waitForLoadState('networkidle');
    
    // Check if configurator loaded successfully
    const configuratorContent = page.locator('[data-testid="configurator"], .configurator, .model-configurator');
    if (await configuratorContent.isVisible()) {
      // Look for category buttons
      const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Options"), .category-button');
      
      if (await categoryButtons.count() > 0) {
        // Click on first category to show options
        await categoryButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Look for View Details buttons
        const viewDetailsButtons = page.locator('button:has-text("View Details")');
        
        if (await viewDetailsButtons.count() > 0) {
          const firstButton = viewDetailsButtons.first();
          
          // Check that button is keyboard accessible
          await firstButton.focus();
          await expect(firstButton).toBeFocused();
          
          // Check that button can be activated with Enter key
          await firstButton.press('Enter');
          await page.waitForLoadState('networkidle');
          
          // Should navigate to product detail page
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/product\/.+/);
        }
      }
    }
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for configurator to load
    await page.waitForLoadState('networkidle');
    
    // Check if configurator loaded successfully
    const configuratorContent = page.locator('[data-testid="configurator"], .configurator, .model-configurator');
    if (await configuratorContent.isVisible()) {
      // Look for category buttons
      const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Options"), .category-button');
      
      if (await categoryButtons.count() > 0) {
        // Click on first category to show options
        await categoryButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Look for View Details buttons
        const viewDetailsButtons = page.locator('button:has-text("View Details")');
        
        if (await viewDetailsButtons.count() > 0) {
          const firstButton = viewDetailsButtons.first();
          
          // Check that button is touch-friendly
          const buttonBox = await firstButton.boundingBox();
          expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
          
          // Click View Details button
          await firstButton.click();
          await page.waitForLoadState('networkidle');
          
          // Should navigate to product detail page
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/product\/.+/);
        }
      }
    }
  });

  test('should handle keyboard shortcuts for View Details', async ({ page }) => {
    // Wait for configurator to load
    await page.waitForLoadState('networkidle');
    
    // Check if configurator loaded successfully
    const configuratorContent = page.locator('[data-testid="configurator"], .configurator, .model-configurator');
    if (await configuratorContent.isVisible()) {
      // Look for category buttons
      const categoryButtons = page.locator('button:has-text("Category"), button:has-text("Options"), .category-button');
      
      if (await categoryButtons.count() > 0) {
        // Click on first category to show options
        await categoryButtons.first().click();
        await page.waitForTimeout(1000);
        
        // Look for option cards
        const optionCards = page.locator('.option-card, [data-testid*="option"]');
        
        if (await optionCards.count() > 0) {
          const firstOptionCard = optionCards.first();
          
          // Focus the option card
          await firstOptionCard.focus();
          
          // Test Ctrl+D shortcut (Windows/Linux)
          await page.keyboard.press('Control+d');
          
          // Should navigate to product detail page
          await page.waitForLoadState('networkidle');
          
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/product\/.+/);
        }
      }
    }
  });
});