import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { cleanupOrphanedStrings } from '@/lib/db-gc';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. 获取所有词条
    const allStrings = await db.localizedString.findMany();

    // 2. 筛选出公共规格词条 (排除专属前缀和系统 UI 前缀)
    const sharedStrings = allStrings.filter((item: any) => {
      const id = item.id;
      const isExclusiveOrSystem = /^(prod_|cat_|case_|SYS_|navbar_)/i.test(id);
      return !isExclusiveOrSystem;
    });

    // 3. 分组并标记重复
    const groups: Record<string, { keepId: string; duplicateIds: string[] }> = {};

    for (const item of sharedStrings) {
      const content = (item.content as any) || {};
      const zh = (content.zh || '').trim();
      const en = (content.en || '').trim();

      // 跳过完全为空的无效词条
      if (!zh && !en) continue;

      const signature = `${zh}___${en}`.toLowerCase();

      if (!groups[signature]) {
        groups[signature] = {
          keepId: item.id,
          duplicateIds: [],
        };
      } else {
        groups[signature].duplicateIds.push(item.id);
      }
    }

    // 4. 建立合并映射关系
    const replacementMap: Record<string, string> = {};
    let totalDuplicates = 0;
    const allDuplicateIds: string[] = [];

    Object.values(groups).forEach((g) => {
      if (g.duplicateIds.length > 0) {
        g.duplicateIds.forEach((dupId) => {
          replacementMap[dupId] = g.keepId;
          allDuplicateIds.push(dupId);
        });
        totalDuplicates += g.duplicateIds.length;
      }
    });

    if (totalDuplicates === 0) {
      return NextResponse.json({
        success: true,
        mergedCount: 0,
        message: '没有发现可合并的重复规格词条！',
      });
    }

    // 5. 遍历并重定向所有产品对重复 ID 的规格引用与优势引用
    const products = await db.product.findMany();
    let updatedProductsCount = 0;

    for (const prod of products) {
      let isUpdated = false;

      // 规格组 specGroups
      let specGroups: any[] = [];
      if (typeof prod.specGroups === 'string') {
        try {
          specGroups = JSON.parse(prod.specGroups);
        } catch (e) {}
      } else if (Array.isArray(prod.specGroups)) {
        specGroups = prod.specGroups;
      }

      if (Array.isArray(specGroups) && specGroups.length > 0) {
        specGroups.forEach((g: any) => {
          if (g.titleId && replacementMap[g.titleId]) {
            g.titleId = replacementMap[g.titleId];
            isUpdated = true;
          }
          if (Array.isArray(g.items)) {
            g.items.forEach((item: any) => {
              if (item.labelId && replacementMap[item.labelId]) {
                item.labelId = replacementMap[item.labelId];
                isUpdated = true;
              }
              if (item.valueId && replacementMap[item.valueId]) {
                item.valueId = replacementMap[item.valueId];
                isUpdated = true;
              }
            });
          }
        });
      }

      // 优势 advantageTextIds
      const advantages = Array.isArray(prod.advantageTextIds) ? prod.advantageTextIds : [];
      const nextAdvantages = advantages.map((advId: string) => {
        if (advId && replacementMap[advId]) {
          isUpdated = true;
          return replacementMap[advId];
        }
        return advId;
      });

      if (isUpdated) {
        await db.product.update({
          where: { id: prod.id },
          data: {
            specGroups: JSON.stringify(specGroups),
            advantageTextIds: nextAdvantages,
          },
        });
        updatedProductsCount++;
      }
    }

    // 6. 执行垃圾回收，物理清理所有引用已降为 0 的重复词条
    await cleanupOrphanedStrings(allDuplicateIds);

    return NextResponse.json({
      success: true,
      mergedCount: totalDuplicates,
      updatedProductsCount,
      message: `成功合并了 ${totalDuplicates} 个重复词条，已重定向 ${updatedProductsCount} 个产品的规格指针。`,
    });
  } catch (error: any) {
    console.error('[API Error] Merge batch POST:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
