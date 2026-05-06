import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

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

    const scriptPath = path.join(process.cwd(), "scripts", "restore-data.sh");
    const sqlPath = path.join("backups", sqlFile);
    const minioPath = path.join("backups", minioFile);

    // Execute the restore script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath} ${sqlPath} ${minioPath}`);
    
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
