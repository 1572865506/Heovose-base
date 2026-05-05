import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting data migration: discrete columns -> content JSON...');

  const translations = await prisma.localizedString.findMany();
  console.log(`Found ${translations.length} records to migrate.`);

  let successCount = 0;
  let errorCount = 0;

  for (const t of translations) {
    try {
      // Create the JSON content object
      const content: Record<string, string> = {};
      if (t.zh) content.zh = t.zh;
      if (t.en) content.en = t.en;
      if (t.idn) content.idn = t.idn;
      if (t.vi) content.vi = t.vi;

      // Update the record
      await prisma.localizedString.update({
        where: { id: t.id },
        data: {
          content: content
        }
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate record ${t.id}:`, error);
      errorCount++;
    }
  }

  console.log('\n✅ Migration finished!');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error('💥 Fatal error during migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
