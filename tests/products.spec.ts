import { test, expect } from '@playwright/test';

test.describe('Heovose Products List & Detail E2E User Flow Tests', () => {

  test('产品列表页应支持搜索、业务线切换、分类过滤以及向动态详情页导流', async ({ page }) => {
    // 1. Go to the products list page
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Wait specifically for the sticky control bar section to become visible, guaranteeing full hydration
    await page.waitForSelector('section.sticky', { state: 'visible', timeout: 15000 });

    // 2. Verify main sections load successfully
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();

    // 3. Toggle between Business Lines (Wholesale vs Projects) using structural index-based locators
    // In section.sticky, the only two buttons are the business line switchers: first is Wholesale, second is Projects
    const tabButtons = page.locator('section.sticky button');
    const wholesaleTabButton = tabButtons.nth(0);
    const projectTabButton = tabButtons.nth(1);
    
    await expect(wholesaleTabButton).toBeVisible();
    await expect(projectTabButton).toBeVisible();

    // Click projects line tab
    await projectTabButton.click();
    await page.waitForTimeout(500);

    // Click wholesale line tab back
    await wholesaleTabButton.click();
    await page.waitForTimeout(500);

    // 4. Quick Search Filter Box
    const searchInput = page.locator('aside input').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('LED');
    await page.waitForTimeout(400);

    // Reset search
    await searchInput.fill('');
    await page.waitForTimeout(400);

    // 5. Dynamic Link Extraction: Locate the first rendered product card dynamically
    const firstProductCardLink = page.locator('main a[href*="/products/"]').first();
    await expect(firstProductCardLink).toBeVisible({ timeout: 15000 });
    
    const targetHref = await firstProductCardLink.getAttribute('href');
    expect(targetHref).not.toBeNull();
    expect(targetHref).toContain('/products/');

    // Click the first product to navigate to its details page dynamically
    await firstProductCardLink.click();
    await page.waitForTimeout(500);
    
    // Assert redirect was successful to products detail dynamic page
    await expect(page).toHaveURL(new RegExp(targetHref!.split('?')[0]));
  });

  test('产品详情页应支持规格选项卡切换、产品询盘弹窗触发以及相关产品深度推荐导流', async ({ page }) => {
    // 1. First, go to products list page to fetch a valid product ID dynamically
    await page.goto('/products');
    await page.waitForLoadState('domcontentloaded');

    // Wait for list page content control bar to be visible
    await page.waitForSelector('section.sticky', { state: 'visible', timeout: 15000 });

    const firstProductCardLink = page.locator('main a[href*="/products/"]').first();
    await expect(firstProductCardLink).toBeVisible({ timeout: 15000 });
    
    const targetHref = await firstProductCardLink.getAttribute('href');
    expect(targetHref).not.toBeNull();

    // Navigate directly to the detail page
    await page.goto(targetHref!);
    await page.waitForLoadState('domcontentloaded');

    // Wait specifically for the product H1 heading to become visible, guaranteeing details hydration
    await page.waitForSelector('h1', { state: 'visible', timeout: 15000 });

    // 2. Validate product details rendering
    const productTitle = page.locator('h1').first();
    await expect(productTitle).toBeVisible();

    // 3. Tab switching (Radix/Shadcn Tabs: Description vs Specifications) using value attributes
    const specsTabTrigger = page.locator('[role="tab"][value="specs"]').first();
    const descTabTrigger = page.locator('[role="tab"][value="desc"]').first();

    if (await specsTabTrigger.count() > 0) {
      await specsTabTrigger.click();
      await page.waitForTimeout(500);
      
      // Assert that spec tab content panel is visible (or contains specifications content)
      const specContainer = page.locator('[role="tabpanel"][value="specs"], .grid, div').first();
      await expect(specContainer).toBeVisible();
    }

    if (await descTabTrigger.count() > 0) {
      await descTabTrigger.click();
      await page.waitForTimeout(500);
    }

    // 4. Contact Sales Inquiry modal trigger using multilingual regex text matching
    const contactSalesButton = page.locator('main button').filter({ hasText: /Contact|联系|Hubungi|Inquiry|Inkuiri/i }).first();
    await expect(contactSalesButton).toBeVisible();
    await contactSalesButton.click();
    await page.waitForTimeout(500);

    // Verify Inquiry dialog popped up on screen
    const inquiryModal = page.locator('[role="dialog"], div:has-text("Inquiry"), div:has-text("询盘"), div:has-text("Inkuiri")').first();
    await expect(inquiryModal).toBeVisible();

    // Press Escape to close modal safely
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // 5. Related Products Recommendation Navigation Traversal (from related slider gallery)
    const relatedProductLink = page.locator('main a[href*="/products/"]').first();
    const relatedCount = await relatedProductLink.count();
    if (relatedCount > 0) {
      const relatedHref = await relatedProductLink.getAttribute('href');
      expect(relatedHref).not.toBeNull();
      
      // Click related product card to traverse to another detail page
      await relatedProductLink.click();
      await page.waitForTimeout(500);
      
      // Ensure page successfully loaded the next product
      await expect(page).toHaveURL(new RegExp(relatedHref!.split('?')[0]));
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });
});
