
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.galleryAsset.count();
  const assets = await prisma.galleryAsset.findMany({ take: 5 });
  const categoryCount = await prisma.galleryCategory.count();
  
  console.log(`GalleryAsset count: ${count}`);
  console.log(`GalleryCategory count: ${categoryCount}`);
  console.log('Sample assets:', JSON.stringify(assets, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
