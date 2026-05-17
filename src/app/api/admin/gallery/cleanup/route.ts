import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import db from '@/lib/db';

const s3 = new S3Client({
  endpoint: `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || '',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const bucket = process.env.STORAGE_BUCKET || 'heovose-assets';

export async function POST() {
  try {
    console.log('[Maintenance] Starting Media Cleanup via API');
    
    // 1. 获取数据库中所有引用的文件名
    const dbAssets = await db.galleryAsset.findMany({ select: { fileName: true } });
    const referencedFiles = new Set(dbAssets.map((a: any) => a.fileName));

    // 2. 获取 MinIO 中所有物理文件
    const listRes = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'uploads/' }));
    const physicalFiles = listRes.Contents || [];

    let deletedCount = 0;
    const deletedFiles: string[] = [];

    for (const file of physicalFiles) {
      if (file.Key && !referencedFiles.has(file.Key)) {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: file.Key }));
        deletedFiles.push(file.Key);
        deletedCount++;
      }
    }

    console.log(`[Maintenance] Cleanup Finished. Deleted ${deletedCount} files.`);
    
    return NextResponse.json({ 
      success: true, 
      deletedCount, 
      deletedFiles,
      message: `成功清理了 ${deletedCount} 个冗余素材文件。` 
    });
  } catch (error: any) {
    console.error('[Maintenance] Cleanup API failed:', error);
    return NextResponse.json({ error: error.message || 'Cleanup failed' }, { status: 500 });
  }
}
