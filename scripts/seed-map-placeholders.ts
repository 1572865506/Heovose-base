import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const translations = [
  {
    id: 'MAP_PLACEHOLDER_TITLE',
    content: {
      zh: '正在布局中...',
      en: 'Expanding soon...',
      id: 'Sedang diperluas...',
    }
  },
  {
    id: 'MAP_PLACEHOLDER_ADDR',
    content: {
      zh: '全球战略布局规划中',
      en: 'Strategic expansion in progress',
      id: 'Perluasan strategis sedang berlangsung',
    }
  },
  {
    id: 'MAP_PLACEHOLDER_DESC',
    content: {
      zh: 'Heovose 正在积极筹建和拓展新的本地化生产与技术服务节点，敬请期待。',
      en: 'Heovose is actively planning and expanding new localized production and technical support hubs.',
      id: 'Heovose sedang aktif merencanakan dan memperluas pusat produksi dan dukungan teknis lokal baru.',
    }
  }
];

async function main() {
  console.log('Seeding localized strings for map placeholder cards...');
  for (const t of translations) {
    await prisma.localizedString.upsert({
      where: { id: t.id },
      update: { content: t.content },
      create: {
        id: t.id,
        content: t.content
      }
    });
  }
  console.log('Seeding map placeholders completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
