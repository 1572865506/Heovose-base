import { test, expect } from '@playwright/test';

test.describe('Heovose Admin Console E2E Verification Suite', () => {

  test('后台登录流程验证 - 支持账号校验拦截与正常登录重定向', async ({ page }) => {
    // Force a standard desktop viewport to ensure the sidebar is expanded and not collapsed
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Visit admin login page (which redirects to /auth/login)
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');

    // Verify unified auth page loaded successfully
    const authTitle = page.locator('form div:has-text("身份安全验证"), div:has-text("Authorized Personnel Only")').first();
    await expect(authTitle).toBeVisible();

    // 2. Submit wrong credentials to test security interceptor
    await page.fill('input[type="email"]', 'wrong@heovose.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Press submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(500);

    // Verify access denied warning displays correctly
    const errorBanner = page.locator('div:has-text("ACCESS DENIED"), div:has-text("登录失败")').first();
    await expect(errorBanner).toBeVisible();

    // 3. Submit valid seeded credentials to log in successfully
    await page.fill('input[type="email"]', 'admin@heovose.com');
    await page.fill('input[type="password"]', 'admin123');
    await submitButton.click();
    await page.waitForTimeout(1500);

    // Verify redirected to admin dashboard and loaded completely
    await expect(page).toHaveURL(/\/admin/);
    await page.waitForSelector('a[href="/admin/products"]', { state: 'visible', timeout: 15000 });
    
    const dashboardHeader = page.locator('h2:has-text("控制面板"), h2:has-text("Overview")').first();
    await expect(dashboardHeader).toBeVisible();
  });

  test('后台主面板数据展示与侧边栏路由跳转验证', async ({ page }) => {
    // Force a standard desktop viewport to ensure the sidebar is expanded and not collapsed
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Perform background auto-login
    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');
    
    await page.fill('input[type="email"]', 'admin@heovose.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/admin/);

    // Wait specifically for a core sidebar link to become visible, guaranteeing full admin session load and hydration
    await page.waitForSelector('a[href="/admin/products"]', { state: 'visible', timeout: 15000 });

    // 2. Verify dashboard statistics are rendered
    const statCardProduct = page.locator('p:has-text("产品总量"), p:has-text("产品"), p:has-text("TOTAL")').first();
    await expect(statCardProduct).toBeVisible();

    // Verify security protocol badge is active
    const securityBadge = page.locator('span:has-text("Security"), span:has-text("验证"), span:has-text("Protocol")').first();
    await expect(securityBadge).toBeVisible();

    // 3. Check sidebar navigations using highly robust href selectors (robust against collapses)
    
    // Check Products Management Navigation
    const productsLink = page.locator('a[href="/admin/products"]').first();
    await expect(productsLink).toBeVisible();
    await productsLink.click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/admin\/products/);
    
    // Check Categories Navigation
    const categoriesLink = page.locator('a[href="/admin/categories"]').first();
    await expect(categoriesLink).toBeVisible();
    await categoriesLink.click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/admin\/categories/);

    // Check Service Centers Navigation
    const serviceCentersLink = page.locator('a[href="/admin/service-centers"]').first();
    await expect(serviceCentersLink).toBeVisible();
    await serviceCentersLink.click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/admin\/service-centers/);

    // Check Inquiries Navigation
    const inquiriesLink = page.locator('a[href="/admin/inquiries"]').first();
    await expect(inquiriesLink).toBeVisible();
    await inquiriesLink.click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/admin\/inquiries/);

    // Check Translations Navigation
    const translationsLink = page.locator('a[href="/admin/translations"]').first();
    await expect(translationsLink).toBeVisible();
    await translationsLink.click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/admin\/translations/);
  });
});
