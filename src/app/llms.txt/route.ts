import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [siteConfigSetting, categories, products] = await Promise.all([
      db.setting.findUnique({ where: { id: 'site' } }),
      db.productCategory.findMany({
        include: { nameText: true, descriptionText: true },
        orderBy: { order: 'asc' },
      }),
      db.product.findMany({
        where: { status: 'published', deletedAt: null },
        include: { nameText: true, descriptionText: true, category: { include: { nameText: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      }),
    ]);

    let siteConfig: any = {};
    if (siteConfigSetting?.value) {
      try { siteConfig = JSON.parse(siteConfigSetting.value); } catch (_) {}
    }

    const siteUrl = siteConfig.siteUrl ? siteConfig.siteUrl.replace(/\/$/, '') : 'https://www.heovose.com';
    const siteTitle = siteConfig.companyName || 'Heovose Technology';
    const contactEmail = siteConfig.email || 'info@heovose.com';

    // 1. 搜集所有产品规格中的翻译 ID (titleId, labelId, valueId)
    const specIds = new Set<string>();
    products.forEach((p: any) => {
      let specs = p.specGroups;
      if (typeof specs === 'string') {
        try { specs = JSON.parse(specs); } catch (_) {}
      }
      if (Array.isArray(specs)) {
        specs.forEach((g: any) => {
          if (g.titleId) specIds.add(g.titleId);
          if (Array.isArray(g.items)) {
            g.items.forEach((item: any) => {
              if (item.labelId) specIds.add(item.labelId);
              if (item.valueId) specIds.add(item.valueId);
            });
          }
        });
      }
    });

    // 2. 批量查出所有规格项的翻译
    let specTranslations: any[] = [];
    if (specIds.size > 0) {
      specTranslations = await db.localizedString.findMany({
        where: { id: { in: Array.from(specIds) } },
      });
    }

    const specMap = new Map<string, any>();
    specTranslations.forEach((st) => {
      let c = st.content;
      if (c && typeof c === 'string') {
        try { c = JSON.parse(c); } catch (_) {}
      }
      specMap.set(st.id, c || {});
    });

    // 提取翻译文本辅助函数
    const getText = (entry: any, lang: string = 'en') => {
      if (!entry) return '';
      const c = entry.content as any;
      if (c && typeof c === 'object') {
        return c[lang] || c.en || c.zh || '';
      }
      return entry[lang] || entry.en || entry.zh || '';
    };

    const getSpecValue = (id?: string | null, fallback?: string, lang: string = 'en') => {
      if (!id) return fallback || '';
      const obj = specMap.get(id);
      if (obj && typeof obj === 'object') {
        const text = obj[lang] || obj.en || obj.zh;
        if (text) return String(text).replace(/\n+/g, '; ');
      }
      return fallback || '';
    };

    let md = `# ${siteTitle} - Industrial Technology & Manufacturing\n\n`;
    md += `> ${siteTitle} is a global industrial manufacturing and intelligent automation solutions provider, specializing in advanced material handling, heavy-duty industrial equipment, automated logistics, and smart manufacturing systems.\n\n`;
    md += `Official Website: ${siteUrl}\n`;
    md += `Contact Email: ${contactEmail}\n\n`;

    md += `## About Heovose\n\n`;
    md += `Heovose designs and manufactures high-performance industrial equipment complying with ISO9001 and CE international standards. Serving manufacturing plants, automated warehouses, cleanrooms, and chemical facilities across North America, Europe, and Southeast Asia.\n\n`;

    md += `## Product Categories\n\n`;
    for (const cat of categories) {
      const catName = getText(cat.nameText, 'en') || cat.slug;
      const catDesc = getText(cat.descriptionText, 'en');
      md += `### ${catName}\n`;
      if (catDesc) md += `${catDesc}\n`;
      md += `- URL: ${siteUrl}/en/products?category=${encodeURIComponent(cat.slug)}\n\n`;
    }

    md += `## Featured Products & Technical Specifications\n\n`;
    for (const prod of products) {
      const prodName = getText(prod.nameText, 'en') || 'Industrial Equipment';
      const prodDesc = getText(prod.descriptionText, 'en');
      const catName = prod.category ? (getText(prod.category.nameText, 'en') || '') : '';

      md += `### [${prodName}](${siteUrl}/en/products/${prod.id})\n`;
      if (catName) md += `- Category: ${catName}\n`;
      if (prodDesc) md += `- Overview: ${prodDesc.replace(/\n+/g, ' ')}\n`;

      // 提取核心规格真实数据
      if (prod.specGroups) {
        let specs: any = prod.specGroups;
        if (typeof specs === 'string') {
          try { specs = JSON.parse(specs); } catch (_) { specs = null; }
        }
        if (Array.isArray(specs) && specs.length > 0) {
          const keySpecs: string[] = [];
          specs.forEach((group: any) => {
            if (Array.isArray(group.items)) {
              group.items.forEach((item: any) => {
                const label = getSpecValue(item.labelId, item.label, 'en');
                const val = getSpecValue(item.valueId, item.value, 'en');
                if (label && val) keySpecs.push(`${label}: ${val}`);
              });
            }
          });
          if (keySpecs.length > 0) {
            md += `- Key Specs: ${keySpecs.slice(0, 6).join(' | ')}\n`;
          }
        }
      }

      md += `- Product Details & Inquiry: ${siteUrl}/en/products/${prod.id}\n\n`;
    }

    md += `## Global Service & Inquiries\n\n`;
    md += `- Technical Support & Quote Requests: ${siteUrl}/en/products\n`;
    md += `- Global Service Centers: ${siteUrl}/en/service-centers\n`;
    md += `- Corporate Information: ${siteUrl}/en/about\n\n`;
    md += `## LLM Full Reference\n\n`;
    md += `- Full Knowledge Base: ${siteUrl}/llms-full.txt\n`;

    return new NextResponse(md, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('[llms.txt Error]', error);
    return new NextResponse('# Heovose Technology\n\nIndustrial Technology & Manufacturing Solutions.\nWebsite: https://www.heovose.com', {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }
}
