import { PrismaClient } from '@prisma/client';
import { calculateImageBrightness } from '../lib/server/image-analysis';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Starting brightness migration...');

  // 1. HomepageBentoItem
  console.log('--- Migrating HomepageBentoItem ---');
  const bentoItems = await prisma.homepageBentoItem.findMany();
  for (const item of bentoItems) {
    if (item.imageUrl && item.brightness === null) {
      console.log(`Analyzing Bento Item: ${item.id}`);
      const brightness = await calculateImageBrightness(item.imageUrl);
      if (brightness !== null) {
        await prisma.homepageBentoItem.update({
          where: { id: item.id },
          data: { brightness }
        });
      }
    }
  }

  // 2. CaseStudy
  console.log('--- Migrating CaseStudy ---');
  const caseStudies = await prisma.caseStudy.findMany();
  for (const item of caseStudies) {
    if (item.imageUrl && item.brightness === null) {
      console.log(`Analyzing Case Study: ${item.id}`);
      const brightness = await calculateImageBrightness(item.imageUrl);
      if (brightness !== null) {
        await prisma.caseStudy.update({
          where: { id: item.id },
          data: { brightness }
        });
      }
    }
  }

  // 3. ProductionStep
  console.log('--- Migrating ProductionStep ---');
  const steps = await prisma.productionStep.findMany();
  for (const item of steps) {
    if (item.imageUrls.length > 0 && item.brightnesses.length === 0) {
      console.log(`Analyzing Production Step: ${item.id}`);
      const brightnesses: number[] = [];
      for (const url of item.imageUrls) {
        const b = await calculateImageBrightness(url) || 128;
        brightnesses.push(b);
      }
      await prisma.productionStep.update({
        where: { id: item.id },
        data: { brightnesses }
      });
    }
  }

  // 4. Product
  console.log('--- Migrating Product ---');
  const products = await prisma.product.findMany();
  for (const item of products) {
    let updateData: any = {};
    let needsUpdate = false;

    if (item.mainImageUrl && item.mainImageBrightness === null) {
      console.log(`Analyzing Product Main Image: ${item.id}`);
      const b = await calculateImageBrightness(item.mainImageUrl);
      if (b !== null) {
        updateData.mainImageBrightness = b;
        needsUpdate = true;
      }
    }

    if (item.galleryImageUrls.length > 0 && item.galleryImageBrightnesses.length === 0) {
      console.log(`Analyzing Product Gallery: ${item.id}`);
      const brightnesses: number[] = [];
      for (const url of item.galleryImageUrls) {
        const b = await calculateImageBrightness(url) || 128;
        brightnesses.push(b);
      }
      updateData.galleryImageBrightnesses = brightnesses;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: item.id },
        data: updateData
      });
    }
  }

  // 5. ProductCategory
  console.log('--- Migrating ProductCategory ---');
  const categories = await prisma.productCategory.findMany();
  for (const item of categories) {
    if (item.thumbnailImageUrl && item.thumbnailBrightness === null) {
      console.log(`Analyzing Category: ${item.id}`);
      const brightness = await calculateImageBrightness(item.thumbnailImageUrl);
      if (brightness !== null) {
        await prisma.productCategory.update({
          where: { id: item.id },
          data: { thumbnailBrightness: brightness }
        });
      }
    }
  }

  // 6. GalleryAsset
  console.log('--- Migrating GalleryAsset ---');
  const assets = await prisma.galleryAsset.findMany({
    where: { type: 'IMAGE' }
  });
  for (const item of assets) {
    if (item.url && item.brightness === null) {
      console.log(`Analyzing Gallery Asset: ${item.id}`);
      const brightness = await calculateImageBrightness(item.url);
      if (brightness !== null) {
        await prisma.galleryAsset.update({
          where: { id: item.id },
          data: { brightness }
        });
      }
    }
  }

  // 7. HomepageContent (heroSlides, heroProjectBg, heroWholesaleBg)
  console.log('--- Migrating HomepageContent ---');
  const home = await prisma.homepageContent.findUnique({ where: { id: 'hero' } });
  if (home) {
    let updateData: any = {};
    let needsUpdate = false;

    // heroSlides
    if (home.heroSlides) {
      const slides = home.heroSlides as any[];
      let slidesChanged = false;
      for (const slide of slides) {
        if (slide.bgImage && slide.brightness === undefined) {
          console.log(`Analyzing Hero Slide: ${slide.id}`);
          const b = await calculateImageBrightness(slide.bgImage);
          if (b !== null) {
            slide.brightness = b;
            slidesChanged = true;
          }
        }
      }
      if (slidesChanged) {
        updateData.heroSlides = slides;
        needsUpdate = true;
      }
    }

    // heroProjectBg
    if (home.heroProjectBg && !(home as any).heroProjectBrightness) {
       // Note: HomepageContent model didn't have brightness field in schema.prisma for these specific fields, 
       // but we can store them in a Json if needed or just skip if we don't use them for contrast.
       // Actually I didn't add brightness fields to HomepageContent in schema.prisma except for the slides (which is JSON).
    }

    if (needsUpdate) {
      await prisma.homepageContent.update({
        where: { id: 'hero' },
        data: updateData
      });
    }
  }

  console.log('✅ Migration completed!');
}

migrate()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
