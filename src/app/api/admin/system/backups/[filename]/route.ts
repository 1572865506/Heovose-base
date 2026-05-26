import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-utils";
import fs from "fs";
import path from "path";

export const GET = withAuth('superadmin', async (
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) => {
  const { filename } = await params;

  // Security check: prevent directory traversal
  if (filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "backups", filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    let contentType = "application/octet-stream";
    if (filename.endsWith(".sql")) {
      contentType = "application/sql";
    } else if (filename.endsWith(".tar")) {
      contentType = "application/x-tar";
    } else if (filename.endsWith(".gz")) {
      contentType = "application/gzip";
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Download failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
