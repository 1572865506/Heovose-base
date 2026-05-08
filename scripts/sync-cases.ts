
import { PrismaClient } from '@prisma/client';
import { translations } from '../src/lib/translations';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Case Studies sync...');

  // 1. Sync Section Titles
  const sectionTitleId = 'CASES_TITLE';
  const sectionSubtitleId = 'CASES_SUBTITLE';

  const sectionTitleContent = {
    zh: translations.zh.cases.title,
    en: translations.en.cases.title,
    id: translations.id.cases.title,
    vi: translations.vi.cases.title,
  };

  const sectionSubtitleContent = {
    zh: translations.zh.cases.subtitle,
    en: translations.en.cases.subtitle,
    id: translations.id.cases.subtitle,
    vi: translations.vi.cases.subtitle,
  };

  await prisma.localizedString.upsert({
    where: { id: sectionTitleId },
    update: { content: sectionTitleContent },
    create: { id: sectionTitleId, content: sectionTitleContent },
  });

  await prisma.localizedString.upsert({
    where: { id: sectionSubtitleId },
    update: { content: sectionSubtitleContent },
    create: { id: sectionSubtitleId, content: sectionSubtitleContent },
  });

  // Update HomepageContent
  await prisma.homepageContent.update({
    where: { id: 'hero' },
    data: {
      casesTitleZh: translations.zh.cases.title,
      casesTitleEn: translations.en.cases.title,
      casesSubtitleZh: translations.zh.cases.subtitle,
      casesSubtitleEn: translations.en.cases.subtitle,
    }
  });

  console.log('✅ Section titles synced.');

  // 2. Sync Individual Cases
  const cases = await prisma.caseStudy.findMany();
  console.log(`🔍 Found ${cases.length} cases to sync.`);

  for (const c of cases) {
    const titleTextId = `case_study_${c.id}_title`;
    const descTextId = `case_study_${c.id}_desc`;
    const tagTextId = `case_study_${c.id}_tag`;

    await prisma.localizedString.upsert({
      where: { id: titleTextId },
      update: { content: { zh: c.titleZh, en: c.titleEn } },
      create: { id: titleTextId, content: { zh: c.titleZh, en: c.titleEn } },
    });

    await prisma.localizedString.upsert({
      where: { id: descTextId },
      update: { content: { zh: c.descZh, en: c.descEn } },
      create: { id: descTextId, content: { zh: c.descZh, en: c.descEn } },
    });

    await prisma.localizedString.upsert({
      where: { id: tagTextId },
      update: { content: { zh: c.tagZh, en: c.tagEn } },
      create: { id: tagTextId, content: { zh: c.tagZh, en: c.tagEn } },
    });

    await prisma.caseStudy.update({
      where: { id: c.id },
      data: {
        titleTextId,
        descriptionTextId: descTextId,
        tagTextId,
      }
    });

    console.log(`  - Synced case: ${c.titleZh}`);
  }

  console.log('✨ All cases synced successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
