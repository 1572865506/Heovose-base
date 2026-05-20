import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Injecting details page translation keys...');
  const transKeys = [
    { id: 'related_products_title', content: { en: 'Related Products', zh: '相关产品', id: 'Produk Terkait', vi: 'Sản phẩm liên quan' } },
    { id: 'explore_more_tech', content: { en: 'Explore more high-end technology', zh: '探索更多高端科技', id: 'Jelajahi teknologi kelas atas lainnya', vi: 'Khám phá thêm công nghệ cao cấp' } },
    { id: 'view_all', content: { en: 'View All', zh: '查看全部', id: 'Lihat Semua', vi: 'Xem tất cả' } },
    { id: 'nav_home', content: { en: 'Home', zh: '首页', id: 'Beranda', vi: 'Trang chủ' } },
    { id: 'nav_products', content: { en: 'Products', zh: '产品中心', id: 'Produk', vi: 'Sản phẩm' } }
  ];

  for (const tKey of transKeys) {
    const existing = await prisma.localizedString.findUnique({
      where: { id: tKey.id }
    });

    if (existing) {
      await prisma.localizedString.update({
        where: { id: tKey.id },
        data: { content: tKey.content }
      });
      console.log(`Updated translation: ${tKey.id}`);
    } else {
      await prisma.localizedString.create({
        data: {
          id: tKey.id,
          content: tKey.content
        }
      });
      console.log(`Created translation: ${tKey.id}`);
    }
  }

  console.log('Injection completed.');
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
