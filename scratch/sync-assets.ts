
import { PrismaClient } from '@prisma/client';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import 'dotenv/config';

const prisma = new PrismaClient();

const s3Client = new S3Client({
  endpoint: `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
    secretAccessKey: process.env.STORAGE_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

async function main() {
  const bucketName = process.env.STORAGE_BUCKET || 'heovose-assets';
  console.log(`Syncing assets from bucket: ${bucketName}`);

  // 1. Get or create a category for restored assets
  let category = await prisma.galleryCategory.findFirst({
    where: { name: 'Restored Assets' }
  });

  if (!category) {
    category = await prisma.galleryCategory.create({
      data: {
        name: 'Restored Assets',
        order: 99
      }
    });
  }

  // 2. List objects in the bucket
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: 'uploads/'
  });

  const { Contents } = await s3Client.send(command);

  if (!Contents) {
    console.log('No objects found in bucket.');
    return;
  }

  console.log(`Found ${Contents.length} objects. Syncing...`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const object of Contents) {
    if (!object.Key) continue;
    if (object.Key.endsWith('/')) continue; // Skip folders

    // Check if already in DB
    const existing = await prisma.galleryAsset.findFirst({
      where: { fileName: object.Key }
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    // Add to DB
    const fileName = object.Key;
    const title = fileName.split('/').pop() || fileName;
    const url = `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}/${bucketName}/${fileName}`;

    await prisma.galleryAsset.create({
      data: {
        title: title.split('.')[0], // Use filename without extension as title
        fileName: fileName,
        url: url,
        fileSize: object.Size || 0,
        categoryId: category.id
      }
    });
    addedCount++;
  }

  console.log(`Sync completed: ${addedCount} added, ${skippedCount} skipped.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
