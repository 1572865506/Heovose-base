import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-utils';
import path from 'path';
import fs from 'fs';

export const POST = withAuth('superadmin', async (request: Request) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    // 与 restore 接口一致的严格文件名校验，防范路径截断与目录穿越
    const allowedRegex = /^(db_backup\.sql(\.gz)?|db_backup_\d{8}_\d{6}\.sql(\.gz)?|minio_backup\.tar(\.gz)?|minio_backup_\d{8}_\d{6}\.tar(\.gz)?)$/;
    if (!allowedRegex.test(filename)) {
      return NextResponse.json({ 
        error: '文件名格式不正确。必须为标准的 db_backup_*.sql(.gz) 或 minio_backup_*.tar(.gz) 格式。' 
      }, { status: 400 });
    }

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filePath = path.join(backupDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, filename });
  } catch (error: any) {
    console.error('Failed to upload backup:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
