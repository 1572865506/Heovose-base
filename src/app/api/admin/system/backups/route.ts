import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import fs from "fs";
import path from "path";

export const GET = withAuth('superadmin', async () => {
  try {
    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(f => !f.startsWith(".")) // Exclude hidden files like .env.backup
      .map(filename => {
        const stats = fs.statSync(path.join(backupDir, filename));
        let type = "OTHER";
        if (filename.endsWith(".sql") || filename.endsWith(".sql.gz")) {
          type = "DATABASE";
        } else if (filename.endsWith(".tar") || filename.endsWith(".tar.gz")) {
          type = "STORAGE";
        }
        return {
          filename,
          size: stats.size,
          time: stats.mtime,
          type
        };
      })
      .sort((a, b) => b.time.getTime() - a.time.getTime());

    return NextResponse.json({ backups });
  } catch (error) {
    console.error("Failed to list backups:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
