import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database...')
  await prisma.mapLocation.deleteMany()
  await prisma.homepageContent.deleteMany()
  await prisma.caseStudy.deleteMany()
  await prisma.productionStep.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.localizedString.deleteMany()
  await prisma.galleryAsset.deleteMany()
  await prisma.galleryCategory.deleteMany()
  await prisma.user.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()

  console.log('Seeding database...')

  // 0. Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@heovose.com' },
    update: {},
    create: {
      email: 'admin@heovose.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'superadmin',
    },
  })

  // 1. Create Localized Strings
  const nameL1 = await prisma.localizedString.create({
    data: {
      content: {
        en: 'High-Performance Mini PC',
        zh: '高性能迷你主机'
      }
    }
  })

  // Details Page & Navigation Global Translation Keys
  const transKeys = [
    { id: 'related_products_title', content: { en: 'Related Products', zh: '相关产品', id: 'Produk Terkait', vi: 'Sản phẩm liên quan' } },
    { id: 'explore_more_tech', content: { en: 'Explore more high-end technology', zh: '探索更多高端科技', id: 'Jelajahi teknologi kelas atas lainnya', vi: 'Khám phá thêm công nghệ cao cấp' } },
    { id: 'view_all', content: { en: 'View All', zh: '查看全部', id: 'Lihat Semua', vi: 'Xem tất cả' } },
    { id: 'nav_home', content: { en: 'Home', zh: '首页', id: 'Beranda', vi: 'Trang chủ' } },
    { id: 'nav_products', content: { en: 'Products', zh: '产品中心', id: 'Produk', vi: 'Sản phẩm' } }
  ];

  for (const tKey of transKeys) {
    await prisma.localizedString.upsert({
      where: { id: tKey.id },
      update: { content: tKey.content },
      create: { id: tKey.id, content: tKey.content }
    });
  }

  const nameL2 = await prisma.localizedString.create({
    data: {
      content: {
        en: 'Curved Gaming Monitor',
        zh: '曲面电竞显示器'
      }
    }
  })

  // 2. Create Categories
  const category1 = await prisma.productCategory.create({
    data: {
      slug: 'mini-pcs',
      thumbnailImageUrl: 'https://placehold.co/600x400?text=Mini+PC',
      nameTextId: nameL1.id
    }
  })

  const category2 = await prisma.productCategory.create({
    data: {
      slug: 'monitors',
      thumbnailImageUrl: 'https://placehold.co/600x400?text=Monitor',
      nameTextId: nameL2.id
    }
  })

  // 3. Create Products
  await prisma.product.createMany({
    data: [
      { nameTextId: nameL1.id, categoryId: category1.id, status: 'published' },
      { nameTextId: nameL2.id, categoryId: category2.id, status: 'published' }
    ]
  })

  // 4. Create Homepage Content
  await prisma.homepageContent.create({
    data: {
      id: 'hero',
      heroHeadlineEn: 'Elevate Your Digital Horizon',
      heroHeadlineZh: '提升您的数字视野',
      heroSubheadlineEn: 'Next-Generation Hardware Solutions for Global Enterprises',
      heroSubheadlineZh: '面向全球企业的下一代硬件解决方案',
      heroWholesaleButtonEn: 'Wholesale Inquiry',
      heroWholesaleButtonZh: '批发咨询',
      heroProjectButtonEn: 'Project Solutions',
      heroProjectButtonZh: '项目方案',
      isVideoEnabled: true,
      videoTitleEn: 'Our Craftsmanship',
      videoTitleZh: '我们的工艺',
      mapTitleEn: 'Global Footprint',
      mapTitleZh: '全球足迹',
      locations: {
        create: [
          {
            type: 'HQ',
            titleEn: 'Shenzhen Headquarters',
            titleZh: '深圳总部',
            addressEn: 'Shenzhen, China',
            addressZh: '中国深圳',
            descEn: 'Global R&D and Operations Center',
            descZh: '全球研发与运营中心',
            posTop: '35%',
            posLeft: '78%'
          },
          {
            type: 'Factory',
            titleEn: 'Indonesia Factory',
            titleZh: '印尼工厂',
            addressEn: 'Batam, Indonesia',
            addressZh: '印度尼西亚巴淡岛',
            descEn: 'Southeast Asia Manufacturing Hub',
            descZh: '东南亚制造中心',
            posTop: '55%',
            posLeft: '82%'
          }
        ]
      }
    }
  })

  // 5. Create Case Studies
  await prisma.caseStudy.createMany({
    data: [
      {
        order: 1,
        tagEn: 'RETAIL',
        tagZh: '智慧零售',
        titleEn: 'Smart POS Integration',
        titleZh: '智能 POS 集成方案',
        descEn: 'Optimizing checkout experiences across 500+ stores.',
        descZh: '优化 500 多家门店的结账体验。',
        imageUrl: 'https://placehold.co/800x600?text=Retail+Case'
      }
    ]
  })

  // 6. Create Production Steps
  await prisma.productionStep.createMany({
    data: [
      {
        order: 1,
        titleEn: 'IQC (Incoming Quality Control)',
        titleZh: 'IQC 来料检验',
        descEn: 'Rigorous testing of all raw materials.',
        descZh: '对所有原材料进行严格测试。',
        imageUrls: ['https://placehold.co/400x300?text=IQC']
      }
    ]
  })

  // 7. Create Gallery Data
  const galCat = await prisma.galleryCategory.create({
    data: {
      name: 'Product Photos',
      order: 1,
    }
  })

  await prisma.galleryAsset.createMany({
    data: [
      {
        title: 'Heovose Factory A',
        url: 'https://placehold.co/800x600?text=Factory+A',
        fileName: 'factory-a.jpg',
        fileSize: 102400,
        categoryId: galCat.id
      },
      {
        title: 'Heovose Office B',
        url: 'https://placehold.co/800x600?text=Office+B',
        fileName: 'office-b.jpg',
        fileSize: 204800,
        categoryId: galCat.id
      }
    ]
  })

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
