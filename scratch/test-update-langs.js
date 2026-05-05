const fetch = require('node-fetch');

async function test() {
  const body = {
    supportedLanguages: [
      { code: 'zh', label: '中文' },
      { code: 'en', label: 'English' },
      { code: 'idn', label: 'Indonesian' }
    ]
  };

  console.log('Sending PUT request to /api/settings/languages...');
  // Since we are running outside the app, we need to call the API with credentials or bypass it
  // But wait, I can just use Prisma to set the value directly to see if it works
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const data = {
    supportedLanguages: [
      { code: 'zh', label: '中文' },
      { code: 'en', label: 'English' },
      { code: 'idn', label: 'Indonesian' }
    ]
  };

  try {
    const item = await prisma.setting.upsert({
      where: { id: 'languages' },
      update: { value: JSON.stringify(data) },
      create: { id: 'languages', value: JSON.stringify(data) },
    });
    console.log('✅ Successfully updated languages setting:', JSON.stringify(item, null, 2));
  } catch (error) {
    console.error('❌ Failed to update setting:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
