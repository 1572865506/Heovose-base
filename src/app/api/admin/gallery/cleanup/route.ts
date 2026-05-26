import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/audit';

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

// GET: 获取最近一次的清理任务状态，或者通过 jobId 查询指定任务进度
export const GET = withAuth('editor', async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const job = await db.cleanupJob.findUnique({
      where: { id: jobId }
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  }

  // 默认返回最近的一条执行记录
  const latestJob = await db.cleanupJob.findFirst({
    orderBy: { startedAt: 'desc' }
  });
  
  return NextResponse.json(latestJob || { status: 'NONE' });
});

// POST: 异步触发清理任务
export const POST = withAuth('editor', async (request: Request, context: any, currentUser: { id: string; role: string; email: string }) => {
  // 1. 检查是否有正在运行的任务 (状态锁机制防御高并发 DoS)
  const runningJob = await db.cleanupJob.findFirst({
    where: { status: 'RUNNING' }
  });

  if (runningJob) {
    return NextResponse.json(
      { error: 'A media cleanup job is already running in the background.' },
      { status: 409 }
    );
  }

  // 2. 创建并锁定 RUNNING 记录
  const job = await db.cleanupJob.create({
    data: {
      status: 'RUNNING',
      startedAt: new Date()
    }
  });

  console.log(`[Maintenance] Cleanup background job ${job.id} registered.`);

  // 3. 异步记录审计日志 (不阻塞)
  logAdminAction(
    request,
    currentUser.id,
    currentUser.email,
    'TRIGGER_MEDIA_CLEANUP',
    { jobId: job.id, triggeredBy: currentUser.email }
  );

  // 4. 异步执行物理清理逻辑 (不进行 await，直接让其在后台微任务队列中消费)
  runCleanupInBackground(job.id).catch(err => {
    console.error(`[Maintenance] Unhandled async cleanup error for job ${job.id}:`, err);
  });

  // 5. 立即向客户端返回 202 Accepted 状态，结束请求连接
  return NextResponse.json({
    success: true,
    jobId: job.id,
    status: 'RUNNING',
    message: '媒体库冗余素材清理任务已在后台启动。'
  }, { status: 202 });
});

// 后台异步执行真实的清理算法
async function runCleanupInBackground(jobId: string) {
  const startTime = Date.now();
  console.log(`[Maintenance] [Job ${jobId}] Starting background file analysis...`);
  
  try {
    // A. 提取数据库中当前所有被引用的资源
    const dbAssets = await db.galleryAsset.findMany({ select: { fileName: true } });
    const referencedFiles = new Set(dbAssets.map((a: any) => a.fileName));

    // B. 获取 MinIO 的物理上传列表
    const listRes = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: 'uploads/' }));
    const physicalFiles = listRes.Contents || [];

    let deletedCount = 0;
    const deletedFiles: string[] = [];

    // C. 串行清理未被数据库引用的多余物理文件
    for (const file of physicalFiles) {
      if (file.Key && !referencedFiles.has(file.Key)) {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: file.Key }));
        deletedFiles.push(file.Key);
        deletedCount++;
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Maintenance] [Job ${jobId}] Finished in ${elapsed}ms. Deleted ${deletedCount} files.`);

    // D. 成功回写执行结果状态
    await db.cleanupJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        deletedCount,
        deletedFiles: deletedFiles
      }
    });

  } catch (error: any) {
    console.error(`[Maintenance] [Job ${jobId}] Failed:`, error);
    
    // E. 异常回写错误状态
    await db.cleanupJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        error: error.message || 'S3/DB connection error during execution'
      }
    }).catch((updateErr: any) => {
      console.error(`[Maintenance] [Job ${jobId}] Critical: Failed to write error status back:`, updateErr);
    });
  }
}
