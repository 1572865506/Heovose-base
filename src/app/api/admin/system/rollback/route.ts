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
    const body = await request.json().catch(() => ({}));
    const rollbackData = body?.rollbackData !== false; // 默认为 true，同时回滚数据

    const scriptPath = path.join(process.cwd(), "scripts", "rollback-system.sh");
    
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({ 
        error: "回滚脚本文件未找到" 
      }, { status: 400 });
    }

    const rollbackInfoPath = path.join(process.cwd(), "backups", "rollback_info.json");
    if (!fs.existsSync(rollbackInfoPath)) {
      return NextResponse.json({ 
        error: "未找到可回退的历史快照信息" 
      }, { status: 400 });
    }

    // 开启维护模式：创建标记文件，阻止外部写操作
    const maintenanceFile = path.join(process.cwd(), ".maintenance");
    fs.writeFileSync(maintenanceFile, "true");

    // 记录回滚审计日志
    logAdminAction(
      request,
      currentUser.id,
      currentUser.email,
      'ROLLBACK_SYSTEM',
      { script: scriptPath, rollbackData }
    );
    
    // 使用 spawn 在后台异步脱机执行，允许父进程独立响应并平滑退出
    const child = spawn("bash", [scriptPath, rollbackData ? "true" : "false"], {
      detached: true,
      stdio: "ignore"
    });

    child.unref();

    return NextResponse.json({ 
      success: true, 
      message: "系统版本回退流程已在后台启动，正安全恢复上一版本代码及数据快照。" 
    });
  } catch (error: any) {
    console.error("Rollback failed to start:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
});
