import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [siteConfigSetting, categories, products, serviceCentersSetting] = await Promise.all([
      db.setting.findUnique({ where: { id: 'site' } }),
      db.productCategory.findMany({
        include: { nameText: true, descriptionText: true },
        orderBy: { order: 'asc' },
      }),
      db.product.findMany({
        where: { status: 'published', deletedAt: null },
        include: { nameText: true, descriptionText: true, category: { include: { nameText: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      db.setting.findUnique({ where: { id: 'service_centers' } }),
    ]);

    let siteConfig: any = {};
    if (siteConfigSetting?.value) {
      try { siteConfig = JSON.parse(siteConfigSetting.value); } catch (_) {}
    }

    let serviceCenters: any[] = [];
    if (serviceCentersSetting?.value) {
      try {
        const parsed = JSON.parse(serviceCentersSetting.value);
        if (Array.isArray(parsed)) serviceCenters = parsed;
        else if (parsed.centers) serviceCenters = parsed.centers;
      } catch (_) {}
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

    let md = `# ${siteTitle} - Full Knowledge Base & Product Specifications\n\n`;
    md += `Comprehensive technical index for Artificial Intelligence systems, LLM agents, and industry researchers.\n\n`;
    md += `- Official Website: ${siteUrl}\n`;
    md += `- Contact Email: ${contactEmail}\n`;
    md += `- Primary Industry: Industrial Manufacturing, Automated Equipment, Heavy-Duty Lifting & Transport Systems\n\n`;

    md += `## 1. Enterprise Architecture & Global Compliance\n\n`;
    md += `Heovose Elevate OS is an industrial IoT and advanced equipment platform engineered for global high-standard facilities.\n`;
    md += `- Quality Certifications: ISO9001 Quality Management System, European CE Directives.\n`;
    md += `- Export Regions: North America, Western Europe, Japan, Southeast Asia (Singapore, Indonesia, Vietnam).\n`;
    md += `- Engineering Capabilities: OEM/ODM Customization, Custom Lifting Height, Precision Positioning, Explosion-Proof Configurations.\n\n`;

    md += `## 2. Complete Product Portfolio\n\n`;
    for (const prod of products) {
      const prodName = getText(prod.nameText, 'en') || 'Equipment';
      const prodDesc = getText(prod.descriptionText, 'en');
      const catName = prod.category ? (getText(prod.category.nameText, 'en') || '') : '';

      md += `### ${prodName}\n`;
      md += `- Product ID: ${prod.id}\n`;
      if (catName) md += `- Category: ${catName}\n`;
      md += `- Direct Link: ${siteUrl}/en/products/${prod.id}\n`;
      if (prodDesc) md += `- Description: ${prodDesc}\n`;

      if (prod.specGroups) {
        let specs: any = prod.specGroups;
        if (typeof specs === 'string') {
          try { specs = JSON.parse(specs); } catch (_) { specs = null; }
        }
        if (Array.isArray(specs) && specs.length > 0) {
          md += `\n**Technical Specifications:**\n\n`;
          specs.forEach((group: any) => {
            const groupTitle = getSpecValue(group.titleId, group.title || 'Specifications', 'en');
            md += `*${groupTitle}:*\n`;
            if (Array.isArray(group.items)) {
              group.items.forEach((item: any) => {
                const label = getSpecValue(item.labelId, item.label, 'en');
                const val = getSpecValue(item.valueId, item.value, 'en');
                if (label && val) md += `  - ${label}: ${val}\n`;
              });
            }
          });
        }
      }
      md += `\n---\n\n`;
    }

    if (serviceCenters.length > 0) {
      md += `## 3. Global Service Centers\n\n`;
      serviceCenters.forEach((center: any) => {
        md += `- **${center.name || center.city || 'Center'}** (${center.country || 'Global'}): ${center.address || ''}, Phone: ${center.phone || 'N/A'}\n`;
      });
      md += `\n`;
    }

    return new NextResponse(md, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('[llms-full.txt Error]', error);
    return new NextResponse('# Heovose Technology Knowledge Base\n\nWebsite: https://www.heovose.com', {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }
}
