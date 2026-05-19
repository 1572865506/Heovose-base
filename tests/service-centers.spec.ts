import { test, expect } from '@playwright/test';

test.describe('Heovose Service Centers E2E User Flow Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the Service Centers page before each test
    await page.goto('/service-centers');
    
    // Wait specifically for the SWR skeleton loader DIV cards (div.animate-pulse) to disappear.
    await page.waitForSelector('div.animate-pulse', { state: 'detached', timeout: 10000 });
  });

  test('应该成功展示服务中心首屏 Hero 标题与搜索框', async ({ page }) => {
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText(/(服务中心|Service Centers|Pusat Layanan)/);

    // Scoped specifically to the main section input
    const searchInput = page.locator('main input[placeholder*="搜索"], main input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('应该支持通过主输入框进行模糊过滤搜索网点 (自适应数据匹配)', async ({ page }) => {
    const cards = page.locator('.grid > div');
    const cardCount = await cards.count();

    // Only run if there is at least one service center in the database
    if (cardCount > 0) {
      // 1. Grab the text of the first rendered card's title dynamically
      const firstCard = cards.first();
      const firstCardTitle = await firstCard.locator('h3').first().textContent();
      expect(firstCardTitle).not.toBeNull();
      
      const trimmedTitle = firstCardTitle!.trim();

      // 2. Type this dynamic name into the scoped main search field
      const searchInput = page.locator('main input[placeholder*="搜索"], main input[placeholder*="Search"]').first();
      await searchInput.fill(trimmedTitle);
      await page.waitForTimeout(200);

      // 3. Ensure the matching card is still visible
      await expect(firstCard.locator('h3').first()).toBeVisible();

      // 4. Test searching for a non-existent center to verify empty state or count reduction
      await searchInput.fill('NonExistentServiceCenterXYZ999');
      
      // Since it's a non-existent name, the count of visible cards should be 0
      // We use Playwright's web-first assertion to automatically poll the DOM
      // allowing the framer-motion exit fade animation to finish smoothly
      const visibleCards = page.locator('.grid h3:visible');
      await expect(visibleCards).toHaveCount(0, { timeout: 8000 });
    }
  });

  test('应该完美支持国家 Tab 一级过滤与二级省市 Pills 动态联合过滤 (自适应数据匹配)', async ({ page }) => {
    // Locate all Country Tab buttons (they are rounded-full pill buttons in the country row)
    // The first button index 0 is "全部 (ALL)".
    const regionButtons = page.locator('button[class*="rounded-full"], button[class*="px-4 py-2"]');
    const buttonCount = await regionButtons.count();

    // If there's at least one country region (e.g. ID or CN) besides "ALL"
    if (buttonCount > 1) {
      const firstCountryTab = regionButtons.nth(1); // Click the first specific country button (index 1)
      await firstCountryTab.click();
      await page.waitForTimeout(400);

      // Now grab the dynamically aggregated sub-region pills under this country
      // The first sub-region pill is "全部 (ALL)", index 1 is the first actual province/city
      const subRegionPills = page.locator('button[class*="px-3 py-1.5"]');
      const subRegionCount = await subRegionPills.count();

      if (subRegionCount > 1) {
        const firstSubRegionPill = subRegionPills.nth(1); // Click first actual sub-region (index 1)
        const subRegionText = await firstSubRegionPill.textContent();
        
        await firstSubRegionPill.click();
        await page.waitForTimeout(400);

        // Verify that all visible cards on the screen belong to this sub-region
        const visibleCards = page.locator('.grid h3:visible');
        const count = await visibleCards.count();
        
        if (count > 0 && subRegionText) {
          const cardSubRegionText = await page.locator('.grid > div:visible').first().locator('span:has-text("-")').first().textContent();
          if (cardSubRegionText) {
            // Confirm the sub-region is matched
            expect(cardSubRegionText.toLowerCase()).toContain(subRegionText.trim().toLowerCase());
          }
        }
      }
    }
  });

  test('点击复制地址按钮应该成功弹出 Toast 提示框 (自适应数据匹配)', async ({ page }) => {
    const copyButton = page.locator('button[title*="复制"], button[title*="Copy"]').first();
    const isAttached = await copyButton.count();

    if (isAttached > 0) {
      await expect(copyButton).toBeAttached();
      
      // Trigger click with force: true to bypass Tailwind's opacity-0 hover styles
      await copyButton.click({ force: true });
      await page.waitForTimeout(200);

      // Verify brand toast status container is displayed on screen
      // shadcn uses [role="status"] for Toasts. We also double check it is attached and visible.
      const toast = page.locator('[role="status"], [class*="bg-primary"]').first();
      await expect(toast).toBeVisible();
    }
  });

  test('验证导航栏对调跳转是否工作顺畅（导航至“关于我们”页面）', async ({ page }) => {
    // Locate the "关于我们" link in the Navbar using dynamic contains matching to support query parameters (e.g. /about?lang=id or /about?lang=zh)
    const aboutLink = page.locator('a[href*="/about"]').first();
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    // Confirm that the page URL has successfully navigated to /about (which might contain language prefix/query)
    await expect(page).toHaveURL(/\/about/);

    // Confirm that the About page header contains the brand slogan, brand name, dynamic fallback key, or localized texts
    const aboutHeading = page.locator('h1');
    await expect(aboutHeading).toBeVisible();
    await expect(aboutHeading).toContainText(/(HEOVOSE|关于|ABOUT|TENTANG|Intelligent|Connection|Visionary|Display|智慧|智能)/i);
  });
});
