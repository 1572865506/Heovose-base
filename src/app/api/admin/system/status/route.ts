import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import fs from "fs";
import path from "path";

export const GET = withAuth('superadmin', async () => {
  try {
    const backupDir = path.join(process.cwd(), "backups");
    let lastBackup = null;
    let updateLog = "";

    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      
      // Find the latest sql backup (including compressed ones)
      const backups = files
        .filter(f => f.startsWith("db_backup_") && (f.endsWith(".sql") || f.endsWith(".sql.gz")))
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

    let version = "v2.1.0-gold";
    try {
      const packageJsonPath = path.join(process.cwd(), "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        if (packageJson && packageJson.version) {
          version = `v${packageJson.version}`;
        }
      }
    } catch (e) {
      console.warn("Failed to read version from package.json:", e);
    }

    return NextResponse.json({
      lastBackup,
      updateLog,
      version,
    });
  } catch (error) {
    console.error("Failed to get system status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
