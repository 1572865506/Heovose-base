import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { logAdminAction } from "@/lib/audit";

export const POST = withAuth('superadmin', async (
  request: Request,
  context: any,
  currentUser: { id: string; role: string; email: string }
) => {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "update-system.sh");
    
    // 开启维护模式：创建标记文件 (问题 4)
    const maintenanceFile = path.join(process.cwd(), ".maintenance");
    fs.writeFileSync(maintenanceFile, "true");

    // 记录升级审计日志 (问题 5)
    logAdminAction(
      request,
      currentUser.id,
      currentUser.email,
      'UPGRADE_SYSTEM',
      { script: scriptPath }
    );
    
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
      error: "Internal Server Error"
    }, { status: 500 });
  }
});

