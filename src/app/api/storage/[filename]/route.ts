import { NextResponse } from "next/server";
import { getFileUrl } from "@/lib/s3";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  const url = await getFileUrl(filename);
  
  if (!url) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Redirect to the signed URL from MinIO
  return NextResponse.redirect(url);
}
