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
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(f => !f.startsWith(".")) // Exclude hidden files like .env.backup
      .map(filename => {
        const stats = fs.statSync(path.join(backupDir, filename));
        return {
          filename,
          size: stats.size,
          time: stats.mtime,
          type: filename.endsWith(".sql") ? "DATABASE" : filename.endsWith(".tar") ? "STORAGE" : "OTHER"
        };
      })
      .sort((a, b) => b.time.getTime() - a.time.getTime());

    return NextResponse.json({ backups });
  } catch (error) {
    console.error("Failed to list backups:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
