const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始将翻译数据中的键名 "idn" 迁移为 "id"...');
  
  const allStrings = await prisma.localizedString.findMany();
  let count = 0;

  for (const str of allStrings) {
    const content = str.content || {};
    if (content.hasOwnProperty('idn')) {
      const newContent = { ...content };
      newContent.id = content.idn; // 复制内容到新键名
      delete newContent.idn;       // 删除旧键名
      
      await prisma.localizedString.update({
        where: { id: str.id },
        data: { content: newContent }
      });
      count++;
    }
  }

  console.log(`✅ 迁移完成！共更新了 ${count} 条记录。`);
}

main()
  .catch(e => console.error('❌ 迁移失败:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
