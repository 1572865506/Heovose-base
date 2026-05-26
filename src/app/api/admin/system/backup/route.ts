import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { logAdminAction } from "@/lib/audit";

const execAsync = promisify(exec);

export const POST = withAuth('superadmin', async (
  request: Request,
  context: any,
  currentUser: { id: string; role: string; email: string }
) => {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "export-data.sh");
    
    // Execute the script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);
    
    console.log("Backup stdout:", stdout);
    if (stderr) console.error("Backup stderr:", stderr);

    const latestBackupFile = stdout.split("\n").filter(line => line.includes("db_backup_")).pop();

    // 记录审计日志
    logAdminAction(
      request,
      currentUser.id,
      currentUser.email,
      'BACKUP_SYSTEM',
      { script: scriptPath, outputFile: latestBackupFile || 'unknown' }
    );

    return NextResponse.json({ 
      success: true, 
      message: "备份成功",
      output: latestBackupFile
    });
  } catch (error: any) {
    console.error("Backup failed:", error);
    return NextResponse.json({ 
      error: "Internal Server Error"
    }, { status: 500 });
  }
});
