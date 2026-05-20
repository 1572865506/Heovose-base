import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("正在查询分类...");
  const categories = await prisma.productCategory.findMany();
  
  let targetCategoryId: string;
  if (categories.length > 0) {
    targetCategoryId = categories[0].id;
    console.log(`选中分类：${categories[0].id}`);
  } else {
    console.log("没有找到分类，正在创建一个临时测试分类...");
    const catNameString = await prisma.localizedString.create({
      data: {
        content: { zh: "测试分类", en: "Test Category" }
      }
    });
    const newCat = await prisma.productCategory.create({
      data: {
        id: "test_category_for_mock",
        slug: "test-category",
        nameTextId: catNameString.id,
      }
    });
    targetCategoryId = newCat.id;
    console.log(`临时测试分类创建成功：${targetCategoryId}`);
  }

  console.log("开始填充 30 个模拟产品数据...");
  for (let i = 1; i <= 30; i++) {
    const num = String(i).padStart(2, '0');
    const productId = `PROD_MOCK_TEST_${num}`;
    
    // 1. 创建名称的多语言字符
    const nameString = await prisma.localizedString.create({
      data: {
        id: `prod_name_${productId}`,
        content: {
          zh: `模拟测试产品-${num}`,
          en: `Mock Test Product-${num}`
        }
      }
    });

    // 2. 创建描述的多语言字符
    const descString = await prisma.localizedString.create({
      data: {
        id: `prod_desc_${productId}`,
        content: {
          id: `prod_desc_${productId}`,
          content: {
            zh: `这是用于测试后台产品管理列表分页效果的模拟产品数据第 ${num} 号。`,
            en: `This is mock product data No.${num} used for testing the pagination effect of the backend product list.`
          }
        }
      } as any // Use broad type to avoid strict TS type checks on schema relation objects during runtime
    });

    // 3. 写入 Product 表
    await prisma.product.upsert({
      where: { id: productId },
      update: {
        categoryId: targetCategoryId,
        status: 'published',
        enabledLanguages: ['zh', 'en'],
        galleryImageUrls: [],
        mainImageUrl: '',
        videoUrl: null
      },
      create: {
        id: productId,
        status: 'published',
        nameTextId: nameString.id,
        descriptionTextId: descString.id,
        categoryId: targetCategoryId,
        enabledLanguages: ['zh', 'en'],
        galleryImageUrls: [],
        mainImageUrl: '',
        videoUrl: null,
        specGroups: {},
        localizedDetails: { zh: '', en: '' }
      }
    });
  }

  console.log("30 个模拟产品数据填充完毕！");
}

main()
  .catch((e) => {
    console.error("数据填充失败：", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
