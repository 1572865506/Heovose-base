import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { spawn } from "child_process";
import path from "path";

export async function POST() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const scriptPath = path.join(process.cwd(), "scripts", "update-system.sh");
    
    // Use spawn to run in background without waiting for completion
    const child = spawn("bash", [scriptPath], {
      detached: true,
      stdio: "ignore"
    });

    child.unref(); // Allow the parent process to exit independently

    return NextResponse.json({ 
      success: true, 
      message: "更新流程已在后台启动，请查看维护日志获取实时进度。" 
    });
  } catch (error: any) {
    console.error("Update failed to start:", error);
    return NextResponse.json({ 
      error: "更新启动失败", 
      details: error.message 
    }, { status: 500 });
  }
}
