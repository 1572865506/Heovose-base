import { NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

export async function GET() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "admin" && (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const backupDir = path.join(process.cwd(), "backups");
    let lastBackup = null;
    let updateLog = "";

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      
      // Find the latest sql backup
      const backups = files
        .filter(f => f.startsWith("db_backup_") && f.endsWith(".sql"))
        .sort()
        .reverse();
      
      if (backups.length > 0) {
        const stats = fs.statSync(path.join(backupDir, backups[0]));
        lastBackup = {
          filename: backups[0],
          time: stats.mtime,
          size: stats.size
        };
      }

      // Read update log if exists
      const logPath = path.join(backupDir, "update_log.txt");
      if (fs.existsSync(logPath)) {
        updateLog = fs.readFileSync(logPath, "utf-8").split("\n").slice(-20).join("\n");
      }
    }

    return NextResponse.json({
      lastBackup,
      updateLog,
      version: "v2.1.0-gold", // Could be read from package.json
    });
  } catch (error) {
    console.error("Failed to get system status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
