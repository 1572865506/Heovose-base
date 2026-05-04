import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  endpoint: `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const prisma = new PrismaClient();
const bucket = process.env.STORAGE_BUCKET || 'heovose-assets';

async function cleanup() {
  console.log('--- Starting Media Cleanup ---');
  
  try {
    // 1. 获取数据库中所有引用的文件名
    const dbAssets = await prisma.galleryAsset.findMany({ select: { fileName: true } });
    const referencedFiles = new Set(dbAssets.map(a => a.fileName));
    console.log(`Referenced files in DB: ${referencedFiles.size}`);

    // 2. 获取 MinIO 中所有物理文件
    const listRes = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'uploads/' }));
    const physicalFiles = listRes.Contents || [];
    console.log(`Physical files in MinIO (under uploads/): ${physicalFiles.length}`);

    let deletedCount = 0;
    for (const file of physicalFiles) {
      if (file.Key && !referencedFiles.has(file.Key)) {
        console.log(`Deleting orphan file: ${file.Key}`);
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: file.Key }));
        deletedCount++;
      }
    }

    console.log('--- Cleanup Finished ---');
    console.log(`Deleted orphan files total: ${deletedCount}`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
