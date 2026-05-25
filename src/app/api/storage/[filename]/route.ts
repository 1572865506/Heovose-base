import { NextResponse } from "next/server";
import { getFileUrl } from "@/lib/s3";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  // 对 filename 进行解码，以防 URL 编码绕过
  const decodedFilename = decodeURIComponent(filename);

  // 防跨越路径检验（拒绝包含 .. 或以 /、. 开头的文件路径）
  if (
    decodedFilename.includes('..') || 
    decodedFilename.startsWith('/') || 
    decodedFilename.startsWith('.')
  ) {
    return NextResponse.json({ error: 'Invalid file path (path traversal detected)' }, { status: 400 });
  }
  
  const url = getFileUrl(decodedFilename);
  
  if (!url) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Redirect to the signed URL from MinIO
  return NextResponse.redirect(url);
}
