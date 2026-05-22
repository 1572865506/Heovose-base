import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Only superadmins can perform restore" }, { status: 403 });
  }

  try {
    const { sqlFile, minioFile } = await request.json();

    if (!sqlFile || !minioFile) {
      return NextResponse.json({ error: "Missing file arguments" }, { status: 400 });
    }

    // Strict validation to prevent shell command injection and directory traversal
    const SQL_FILE_REGEX = /^(db_backup\.sql|db_backup_\d{8}_\d{6}\.sql)$/;
    const MINIO_FILE_REGEX = /^(minio_backup\.tar|minio_backup_\d{8}_\d{6}\.tar)$/;

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

    // Execute the restore script securely using execFile
    const { stdout, stderr } = await execFileAsync("bash", [scriptPath, sqlPath, minioPath]);
    
    console.log("Restore stdout:", stdout);
    if (stderr) console.error("Restore stderr:", stderr);

    return NextResponse.json({ 
      success: true, 
      message: "数据还原成功",
      output: stdout
    });
  } catch (error: any) {
    console.error("Restore failed:", error);
    return NextResponse.json({ 
      error: "还原执行失败", 
      details: error.message 
    }, { status: 500 });
  }
}
