import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const scriptPath = path.join(process.cwd(), "scripts", "export-data.sh");
    
    // Execute the script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);
    
    console.log("Backup stdout:", stdout);
    if (stderr) console.error("Backup stderr:", stderr);

    return NextResponse.json({ 
      success: true, 
      message: "备份成功",
      output: stdout.split("\n").filter(line => line.includes("db_backup_")).pop()
    });
  } catch (error: any) {
    console.error("Backup failed:", error);
    return NextResponse.json({ 
      error: "备份执行失败", 
      details: error.message 
    }, { status: 500 });
  }
}
