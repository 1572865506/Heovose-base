import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export const POST = withAuth('superadmin', async () => {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "check-update.sh");
    const { stdout } = await execFileAsync("bash", [scriptPath]);
    
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
