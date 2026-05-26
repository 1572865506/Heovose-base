import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { logAdminAction } from "@/lib/audit";

const execFileAsync = promisify(execFile);

export const POST = withAuth('superadmin', async (
  request: Request,
  context: any,
  currentUser: { id: string; role: string; email: string }
) => {
  const maintenanceFile = path.join(process.cwd(), ".maintenance");
  try {
    const { sqlFile, minioFile } = await request.json();

    if (!sqlFile || !minioFile) {
      return NextResponse.json({ error: "Missing file arguments" }, { status: 400 });
    }

    // Strict validation to prevent shell command injection and directory traversal
    const SQL_FILE_REGEX = /^(db_backup\.sql(\.gz)?|db_backup_\d{8}_\d{6}\.sql(\.gz)?)$/;
    const MINIO_FILE_REGEX = /^(minio_backup\.tar(\.gz)?|minio_backup_\d{8}_\d{6}\.tar(\.gz)?)$/;

    if (!SQL_FILE_REGEX.test(sqlFile)) {
      return NextResponse.json({ error: "Invalid SQL backup file format" }, { status: 400 });
    }

    if (!MINIO_FILE_REGEX.test(minioFile)) {
      return NextResponse.json({ error: "Invalid MinIO backup file format" }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), "scripts", "restore-data.sh");
    const sqlPath = path.join(process.cwd(), "backups", sqlFile);
    const minioPath = path.join(process.cwd(), "backups", minioFile);

    // Ensure both files exist before attempting to restore
    if (!fs.existsSync(sqlPath) || !fs.existsSync(minioPath)) {
      return NextResponse.json({ error: "Backup files not found" }, { status: 404 });
    }

    // 开启维护模式：创建标记文件 (问题 4)
    fs.writeFileSync(maintenanceFile, "true");

    // Execute the restore script securely using execFile
    const { stdout, stderr } = await execFileAsync("bash", [scriptPath, sqlPath, minioPath]);
    
    console.log("Restore stdout:", stdout);
    if (stderr) console.error("Restore stderr:", stderr);

    // 记录审计日志
    logAdminAction(
      request,
      currentUser.id,
      currentUser.email,
      'RESTORE_SYSTEM',
      { sqlFile, minioFile }
    );

    return NextResponse.json({ 
      success: true, 
      message: "数据还原成功",
      output: stdout
    });
  } catch (error: any) {
    console.error("Restore failed:", error);
    return NextResponse.json({ 
      error: "Internal Server Error"
    }, { status: 500 });
  } finally {
    // 无论还原成功还是失败，均安全释放维护状态文件锁，保障服务正常可用 (问题 4)
    if (fs.existsSync(maintenanceFile)) {
      try {
        fs.unlinkSync(maintenanceFile);
      } catch (err) {
        console.error("Failed to clean maintenance file:", err);
      }
    }
  }
});

