import { test, expect } from '@playwright/test';

test.describe('Products Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
  });

  test('should load products page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Products - HS Mobility/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: 'Our Curated Product Collection' })).toBeVisible();
    
    // Check featured products section
    await expect(page.getByRole('heading', { name: 'Featured Products' })).toBeVisible();
  });

  test('should display exactly 10 curated products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]', { timeout: 10000 });
    
    // Count product cards
    const productCards = page.locator('[data-testid^="product-card-"]');
    await expect(productCards).toHaveCount(10);
  });

  test('should navigate to product detail page when clicking product card', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]', { timeout: 10000 });
    
    // Get first product card
    const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
    
    // Click on the product card
    await firstProductCard.click();
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/product\/.+/);
  });

  test('should navigate to contact section when clicking Contact Us', async ({ page }) => {
    // Scroll to call to action section
    await page.locator('text=Need Help Choosing?').scrollIntoViewIfNeeded();
    
    // Click Contact Us button
    await page.getByRole('link', { name: 'Contact Us' }).click();
    
    // Should navigate to homepage contact section
    await expect(page).toHaveURL('/#contact-us');
  });

  test('should navigate to FAQ section when clicking View FAQs', async ({ page }) => {
    // Scroll to call to action section
    await page.locator('text=Need Help Choosing?').scrollIntoViewIfNeeded();
    
    // Click View FAQs button
    await page.getByRole('link', { name: 'View FAQs' }).click();
    
    // Should navigate to homepage FAQ section
    await expect(page).toHaveURL('/#faq');
  });

  test('should display features section correctly', async ({ page }) => {
    // Scroll to features section
    await page.locator('text=Why Choose HS Mobility?').scrollIntoViewIfNeeded();
    
    // Check all three features are visible
    await expect(page.getByText('Quality Assurance')).toBeVisible();
    await expect(page.getByText('Expert Support')).toBeVisible();
    await expect(page.getByText('Flexible Financing')).toBeVisible();
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/graphql', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    // Navigate to products page
    await page.goto('/products');
    
    // Should show error message
    await expect(page.getByText('Products Temporarily Unavailable')).toBeVisible();
    await expect(page.getByText('Return to Home')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that page loads on mobile
    await expect(page.getByRole('heading', { name: 'Our Curated Product Collection' })).toBeVisible();
    
    // Check that products grid is responsive
    const productsGrid = page.locator('.grid').first();
    await expect(productsGrid).toBeVisible();
    
    // Check that call to action buttons stack vertically on mobile
    const ctaContainer = page.locator('text=Need Help Choosing?').locator('..').locator('.flex');
    await expect(ctaContainer).toHaveClass(/flex-col/);
  });

  test('should be responsive on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that page loads on tablet
    await expect(page.getByRole('heading', { name: 'Our Curated Product Collection' })).toBeVisible();
    
    // Check that products grid adapts to tablet
    const productsGrid = page.locator('.grid').first();
    await expect(productsGrid).toBeVisible();
  });

  test('should be responsive on desktop devices', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check that page loads on desktop
    await expect(page.getByRole('heading', { name: 'Our Curated Product Collection' })).toBeVisible();
    
    // Check that products grid shows 4 columns on desktop, 5 on 2xl
    const productsGrid = page.locator('.grid').first();
    await expect(productsGrid).toHaveClass(/xl:grid-cols-4/);
    await expect(productsGrid).toHaveClass(/2xl:grid-cols-5/);
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Products - HS Mobility/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Discover our curated selection/);
  });

  test('should have proper heading hierarchy for accessibility', async ({ page }) => {
    // Check h1 heading
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our Curated Product Collection');
    
    // Check h2 headings
    const h2Headings = page.getByRole('heading', { level: 2 });
    await expect(h2Headings).toHaveCount(2); // Featured Products and Why Choose HS Mobility
    
    // Check h3 headings in features section
    const h3Headings = page.getByRole('heading', { level: 3 });
    await expect(h3Headings).toHaveCount(3); // Quality Assurance, Expert Support, Flexible Financing
  });

  test('should load within acceptable performance metrics', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to products page
    await page.goto('/products');
    
    // Wait for main content to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle keyboard navigation correctly', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should work with screen readers', async ({ page }) => {
    // Check that all headings have proper text content
    const headings = page.getByRole('heading');
    const headingCount = await headings.count();
    
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();
      expect(text).toBeTruthy();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]', { timeout: 10000 });
    
    // Navigate to a product detail page
    const firstProductCard = page.locator('[data-testid^="product-card-"]').first();
    await firstProductCard.click();
    
    // Navigate back to products page
    await page.goBack();
    
    // Should still show products page
    await expect(page).toHaveURL('/products');
    await expect(page.getByRole('heading', { name: 'Our Curated Product Collection' })).toBeVisible();
  });
});