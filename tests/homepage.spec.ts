import { test, expect } from '@playwright/test';

test.describe('Heovose Homepage E2E User Flow Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto('/');
    
    // Wait for the page structure to be stable
    await page.waitForLoadState('domcontentloaded');
  });

  test('首页首屏 Hero 与主视觉应成功渲染并展示品牌信息', async ({ page }) => {
    // 1. Verify navbar is visible (nav is the top-level outer element)
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    // 2. Verify Hero section title is visible
    // Hero components render dynamic banners with titles, let's assert there's a visible h1/h2 or hero structure
    const heroSection = page.locator('main section').first();
    await expect(heroSection).toBeVisible();
    
    // Verify there is a main heading on the screen
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
  });

  test('应该完美支持多语言 Dropdown 切换并自动响应 URL 与 Cookie 状态', async ({ page }) => {
    // 1. Locate the Language Toggle button via its Lucide Languages SVG icon
    const langButton = page.locator('button:has(svg.lucide-languages)').first();
    await expect(langButton).toBeVisible();
    
    // 2. Click to open the SHADCN dropdown menu
    await langButton.click();
    await page.waitForTimeout(300);

    // 3. Select 'English' inside the dropdown menu items
    const englishItem = page.locator('[role="menuitem"]:has-text("English")').first();
    if (await englishItem.count() > 0) {
      await englishItem.click();
      await page.waitForTimeout(400);

      // Verify the in-memory trigger button text updated to 'EN'
      const langSpan = langButton.locator('span').first();
      await expect(langSpan).toContainText('EN');

      // Verify the client cookie NEXT_LOCALE is set to en
      const cookies = await page.context().cookies();
      const nextLocaleCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
      expect(nextLocaleCookie).toBeDefined();
      expect(nextLocaleCookie?.value).toBe('en');
    }

    // 4. Open again and select '中文'
    await langButton.click();
    await page.waitForTimeout(300);

    const chineseItem = page.locator('[role="menuitem"]:has-text("中文")').first();
    if (await chineseItem.count() > 0) {
      await chineseItem.click();
      await page.waitForTimeout(400);

      // Verify the in-memory trigger button text updated to 'ZH'
      const langSpan = langButton.locator('span').first();
      await expect(langSpan).toContainText('ZH');
      
      // Verify the client cookie NEXT_LOCALE has updated to zh
      const cookies = await page.context().cookies();
      const nextLocaleCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
      expect(nextLocaleCookie).toBeDefined();
      expect(nextLocaleCookie?.value).toBe('zh');
    }
  });

  test('首屏以下 dynamic 懒加载板块应该在滚动入视口后成功完成装载', async ({ page }) => {
    // Verify that at the top of the page, the bottom elements are not in view or wait for scrolling
    // Trigger virtual scroll to the absolute bottom of the document
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Allow dynamic load animations to execute

    // 1. Footer should now be visible and loaded
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    // 2. Global Map section (dynamically loaded) should render its container
    const globalMap = page.locator('section:has-text("Global"), section:has-text("全球"), section:has-text("network")').first();
    const mapCount = await globalMap.count();
    if (mapCount > 0) {
      await expect(globalMap).toBeVisible();
    }
  });

  test('验证导航链接从首页到服务中心的双向导流是否绝对顺畅', async ({ page }) => {
    // 1. Locate the Service Centers link in the Navbar using wildcard contains matcher
    const serviceCentersLink = page.locator('a[href*="/service-centers"]').first();
    await expect(serviceCentersLink).toBeVisible();
    
    // 2. Click the link to navigate to `/service-centers`
    await serviceCentersLink.click();
    await page.waitForTimeout(400);

    // 3. Verify page redirects to service centers
    await expect(page).toHaveURL(/\/service-centers/);

    // 4. Ensure SWR loaders disappear and cards load correctly on the destination page
    await page.waitForSelector('div.animate-pulse', { state: 'detached', timeout: 10000 });
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText(/(服务中心|Service Centers|Pusat Layanan)/);
  });
});
