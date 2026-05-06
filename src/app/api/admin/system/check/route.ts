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
    const scriptPath = path.join(process.cwd(), "scripts", "check-update.sh");
    const { stdout } = await execAsync(`bash ${scriptPath}`);
    
    const result = stdout.trim();
    if (result === "UP_TO_DATE") {
      return NextResponse.json({ hasUpdate: false });
    } else if (result.startsWith("NEW_UPDATES")) {
      const [, count, logs] = result.split("|");
      return NextResponse.json({ 
        hasUpdate: true, 
        count: parseInt(count), 
        logs: logs.split("\n") 
      });
    }

    return NextResponse.json({ hasUpdate: false });
  } catch (error: any) {
    console.error("Check update failed:", error);
    return NextResponse.json({ error: "检查失败", details: error.message }, { status: 500 });
  }
}
