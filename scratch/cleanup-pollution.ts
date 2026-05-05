import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  console.log('🧹 Cleaning up database pollution: removing values that match the record ID...');

  const translations = await prisma.localizedString.findMany();
  let count = 0;

  for (const t of translations) {
    const content = (t.content as any) || {};
    let changed = false;
    const newContent = { ...content };

    Object.keys(newContent).forEach(lang => {
      // 如果内容等于 ID (忽略大小写) 且不是中英文
      if (lang !== 'zh' && lang !== 'en' && 
          typeof newContent[lang] === 'string' && 
          newContent[lang].toLowerCase() === t.id.toLowerCase()) {
        console.log(`  - Removing ID-value from ${t.id} [${lang}]`);
        delete newContent[lang];
        changed = true;
      }
    });

    if (changed) {
      await prisma.localizedString.update({
        where: { id: t.id },
        data: { content: newContent }
      });
      count++;
    }
  }

  console.log(`\n✅ Done! Cleaned up ${count} records.`);
  await prisma.$disconnect();
}

main();
