import db from './db';

const GC_PREFIXES = ['biz_tr_', 'prod_', 'psl_', 'psv_', 'psg_', 'cat_', 'adv_', 'case_study_', 'process_step_', 'MAP_LOC_'];
const CUID_REGEX = /^c[a-z0-9]{24}$/i;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function shouldGC(id: string): boolean {
  if (!id) return false;
  if (GC_PREFIXES.some(prefix => id.startsWith(prefix))) return true;
  if (CUID_REGEX.test(id)) return true;
  if (UUID_REGEX.test(id)) return true;
  return false;
}

export function extractIdsFromSpecGroups(specGroups: any): string[] {
  const ids: string[] = [];
  if (!specGroups) return ids;

  let groups = [];
  if (typeof specGroups === 'string') {
    try {
      groups = JSON.parse(specGroups);
    } catch (e) {
      console.error('Failed to parse specGroups string:', e);
    }
  } else if (Array.isArray(specGroups)) {
    groups = specGroups;
  }

  if (Array.isArray(groups)) {
    groups.forEach((g: any) => {
      if (g?.titleId) ids.push(g.titleId);
      if (Array.isArray(g?.items)) {
        g.items.forEach((item: any) => {
          if (item?.labelId) ids.push(item.labelId);
          if (item?.valueId) ids.push(item.valueId);
        });
      }
    });
  }
  return ids;
}

export function extractIdsFromProduct(product: any): string[] {
  const ids: string[] = [];
  if (!product) return ids;
  if (product.nameTextId) ids.push(product.nameTextId);
  if (product.descriptionTextId) ids.push(product.descriptionTextId);

  const specIds = extractIdsFromSpecGroups(product.specGroups);
  ids.push(...specIds);

  if (Array.isArray(product.advantageTextIds)) {
    product.advantageTextIds.forEach((advId: string) => {
      if (advId) ids.push(advId);
    });
  }

  return ids;
}

export async function cleanupOrphanedStrings(releasedIds: string[]) {
  const targetIds = Array.from(new Set(releasedIds.filter(id => id && shouldGC(id))));
  console.log('[GC] Released IDs from update/delete:', releasedIds);
  console.log('[GC] Filtered target IDs for cleanup:', targetIds);
  if (targetIds.length === 0) return;

  try {
    // 1. 获取全站产品最新的 specGroups 所引用的全部 ID 集合，只做 1 次数据库拉取
    const allProducts = await db.product.findMany({
      select: { specGroups: true }
    });
    
    const activeSpecIds = new Set<string>();
    allProducts.forEach((prod: { specGroups: any }) => {
      extractIdsFromSpecGroups(prod.specGroups).forEach(specId => {
        if (specId) activeSpecIds.add(specId);
      });
    });

    // 2. 依次检查每个候选 ID 是否被其他字段引用
    for (const id of targetIds) {
      // a. 如果被任一产品规格引用，则不能清理
      if (activeSpecIds.has(id)) {
        console.log(`[GC] Skipping (referenced by active specGroups): ${id}`);
        continue;
      }

      // b. 如果被产品基础多语言字段引用，则不能清理
      const productRefCount = await db.product.count({
        where: {
          OR: [
            { nameTextId: id },
            { descriptionTextId: id }
          ]
        }
      });
      if (productRefCount > 0) {
        console.log(`[GC] Skipping (referenced by product fields): ${id}`);
        continue;
      }

      // b2. 如果被产品核心优势引用，则不能清理
      const advantageRefCount = await db.product.count({
        where: {
          advantageTextIds: {
            has: id
          }
        }
      });
      if (advantageRefCount > 0) {
        console.log(`[GC] Skipping (referenced by product advantages): ${id}`);
        continue;
      }

      // c. 如果被产品分类多语言字段引用，则不能清理
      const categoryRefCount = await db.productCategory.count({
        where: {
          OR: [
            { nameTextId: id },
            { descriptionTextId: id }
          ]
        }
      });
      if (categoryRefCount > 0) {
        console.log(`[GC] Skipping (referenced by category fields): ${id}`);
        continue;
      }

      // d. 如果被案例研究引用，不能清理
      const caseStudyRefCount = await db.caseStudy.count({
        where: {
          OR: [
            { titleTextId: id },
            { tagTextId: id },
            { descriptionTextId: id }
          ]
        }
      });
      if (caseStudyRefCount > 0) {
        console.log(`[GC] Skipping (referenced by caseStudy fields): ${id}`);
        continue;
      }

      // e. 如果被生产步骤引用，不能清理
      const productionStepRefCount = await db.productionStep.count({
        where: {
          OR: [
            { titleTextId: id },
            { descriptionTextId: id }
          ]
        }
      });
      if (productionStepRefCount > 0) {
        console.log(`[GC] Skipping (referenced by productionStep fields): ${id}`);
        continue;
      }

      // f. 如果被地图位置引用，不能清理
      const mapLocationRefCount = await db.mapLocation.count({
        where: {
          OR: [
            { titleTextId: id },
            { addressTextId: id },
            { descTextId: id }
          ]
        }
      });
      if (mapLocationRefCount > 0) {
        console.log(`[GC] Skipping (referenced by mapLocation fields): ${id}`);
        continue;
      }

      // g. 如果被首页内容引用，不能清理
      const homepageContentRefCount = await db.homepageContent.count({
        where: {
          OR: [
            { casesSubtitleTextId: id },
            { casesTitleTextId: id },
            { processSubtitleTextId: id },
            { processTitleTextId: id },
            { mapSubtitleTextId: id },
            { mapTitleTextId: id }
          ]
        }
      });
      if (homepageContentRefCount > 0) {
        console.log(`[GC] Skipping (referenced by homepageContent fields): ${id}`);
        continue;
      }

      // 3. 全站引用为 0，彻底从 LocalizedString 中删除
      console.log(`[GC] Deleting orphaned LocalizedString: ${id}`);
      await db.localizedString.delete({
        where: { id }
      });
    }
  } catch (error) {
    console.error('[GC Error] Failed to cleanup orphaned localized strings:', error);
  }
}

export async function getLocalizedStringRefCount(id: string): Promise<number> {
  try {
    const allProducts = await db.product.findMany({
      select: { specGroups: true }
    });
    
    let specRefCount = 0;
    allProducts.forEach((prod: { specGroups: any }) => {
      const ids = extractIdsFromSpecGroups(prod.specGroups);
      specRefCount += ids.filter(x => x === id).length;
    });

    const productRefCount = await db.product.count({
      where: {
        OR: [
          { nameTextId: id },
          { descriptionTextId: id }
        ]
      }
    });

    const advantageRefCount = await db.product.count({
      where: {
        advantageTextIds: {
          has: id
        }
      }
    });

    const categoryRefCount = await db.productCategory.count({
      where: {
        OR: [
          { nameTextId: id },
          { descriptionTextId: id }
        ]
      }
    });

    const caseStudyRefCount = await db.caseStudy.count({
      where: {
        OR: [
          { titleTextId: id },
          { tagTextId: id },
          { descriptionTextId: id }
        ]
      }
    });

    const productionStepRefCount = await db.productionStep.count({
      where: {
        OR: [
          { titleTextId: id },
          { descriptionTextId: id }
        ]
      }
    });

    const mapLocationRefCount = await db.mapLocation.count({
      where: {
        OR: [
          { titleTextId: id },
          { addressTextId: id },
          { descTextId: id }
        ]
      }
    });

    const homepageContentRefCount = await db.homepageContent.count({
      where: {
        OR: [
          { casesSubtitleTextId: id },
          { casesTitleTextId: id },
          { processSubtitleTextId: id },
          { processTitleTextId: id },
          { mapSubtitleTextId: id },
          { mapTitleTextId: id }
        ]
      }
    });

    return specRefCount + productRefCount + advantageRefCount + categoryRefCount + caseStudyRefCount + productionStepRefCount + mapLocationRefCount + homepageContentRefCount;
  } catch (error) {
    console.error('[RefCount Error] Failed to calculate reference count for id:', id, error);
    return 0;
  }
}


