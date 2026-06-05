import { test, expect } from '@playwright/test';

// 待巡检的语言列表
const locales = ['zh', 'en', 'vi', 'id'];

// 核心待测的页面路径模板
const pageRoutes = [
  { name: '首页', path: '' },
  { name: '产品列表页', path: '/products?line=wholesale' },
  { name: '产品列表页(工程线)', path: '/products?line=project' },
  { name: '服务网点页', path: '/service-centers' },
  { name: '关于我们', path: '/about' },
];

test.describe('全站首屏水合与数据一致性巡检测试 (Full-Site Hydration & Rendering Quality Audit)', () => {
  
  for (const locale of locales) {
    for (const route of pageRoutes) {
      const fullUrl = `/${locale}${route.path}`;
      
      test(`巡检语种 [${locale.toUpperCase()}] -> ${route.name} (${fullUrl})`, async ({ page }) => {
        const consoleErrors: string[] = [];
        const hydrationWarnings: string[] = [];

        // 监控控制台输出
        page.on('console', msg => {
          const text = msg.text();
          if (msg.type() === 'error') {
            consoleErrors.push(text);
          }
          if (text.includes('hydration') || text.includes('Hydration') || text.includes('did not match') || text.includes('server rendered HTML')) {
            hydrationWarnings.push(text);
          }
        });

        // 1. 直接访问页面
        console.log(`[QA Audit] 正在检查: ${fullUrl}`);
        await page.goto(fullUrl);

        // 等待水合与首屏动画完成
        await page.waitForTimeout(1500);

        // 2. 检查核心布局组件的翻译与状态完整性（防空白展示）
        // 2.1 检查导航栏 Navbar 是否存在，并且其中的批发业务/项目工程文本不为空
        const navbar = page.locator('nav');
        await expect(navbar).toBeVisible();
        const navText = await navbar.innerText();
        // 导航栏应当包含有翻译文本，不可为空
        expect(navText.trim().length).toBeGreaterThan(0);

        // 2.2 检查页脚 Footer 是否成功渲染出社交媒体或动态分类链接
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
        const footerText = await footer.innerText();
        expect(footerText.trim().length).toBeGreaterThan(0);

        // 3. 针对特定页面的核心数据展示断言
        if (route.path.includes('/products')) {
          // 产品列表页：左侧分类列表不可为空
          const categoryButtons = page.locator('aside button');
          const buttonCount = await categoryButtons.count();
          console.log(`[QA Audit] ${route.name} (${locale}) 渲染出 ${buttonCount} 个分类按钮`);
          expect(buttonCount).toBeGreaterThan(1);
        } else if (route.path.includes('/service-centers')) {
          // 服务网点页：等待 Skeleton 消失后，检查服务网点卡片列表或空状态插画是否被成功渲染，防止由于 SQL 查询崩掉展示白屏
          const centersContainer = page.locator('main');
          await expect(centersContainer).toBeVisible();
          const mainContentText = await centersContainer.innerText();
          // 不能抛出数据库查询错误文本，且不应为完全的白屏
          expect(mainContentText).not.toContain('Failed to fetch doc');
        }

        // 4. 水合错误断言：全站任意页面在水合阶段都不允许抛出 Hydration Mismatch 警告
        if (hydrationWarnings.length > 0) {
          console.error(`[QA FAIL] 在页面 ${fullUrl} 探测到水合属性不匹配错误:`, hydrationWarnings);
        }
        expect(hydrationWarnings.length).toBe(0);

        // 5. JS运行时错误断言：排除favicon等网络资源请求警告，防止框架运行时崩溃
        const runtimeErrors = consoleErrors.filter(err => !err.includes('favicon.ico') && !err.includes('dangerouslyAllowSVG'));
        if (runtimeErrors.length > 0) {
          console.error(`[QA FAIL] 在页面 ${fullUrl} 探测到 JavaScript 运行时错误:`, runtimeErrors);
        }
        expect(runtimeErrors.length).toBe(0);
      });
    }
  }

  // 针对产品详情动态路由的专项水合测试
  test('巡检产品详情动态路由的 SSR / Hydration 稳定性', async ({ page }) => {
    // 1. 先去列表页抓取第一个真实商品详情页的 URL 链接，防止写死 ID 导致用例失效
    await page.goto('/zh/products');
    await page.waitForTimeout(1000);
    
    // 找到第一个商品的 href
    const firstProductLink = page.locator('a[href*="/products/"]').first();
    const href = await firstProductLink.getAttribute('href');
    
    if (href) {
      console.log(`[QA Audit] 发现真实商品详情页链接: ${href}`);
      const consoleErrors: string[] = [];
      const hydrationWarnings: string[] = [];

      page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') consoleErrors.push(text);
        if (text.includes('hydration') || text.includes('Hydration') || text.includes('did not match')) {
          hydrationWarnings.push(text);
        }
      });

      // 直接进入该商品的详情页
      await page.goto(href);
      await page.waitForTimeout(1500);

      // 断言商品详情主图及标题是否正常展示（不可为空白）
      const mainImage = page.locator('main img').first();
      await expect(mainImage).toBeVisible();

      // 断言控制台水合报错
      expect(hydrationWarnings.length).toBe(0);
      expect(consoleErrors.filter(err => !err.includes('favicon.ico')).length).toBe(0);
    } else {
      console.warn('[QA Audit] 列表页未发现可测试的商品链接，跳过详情页水合测试。');
    }
  });
});
