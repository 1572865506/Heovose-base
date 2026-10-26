import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const pdfBase64 = formData.get('pdfBase64') as string | null;
    const rawFileName = (formData.get('filename') as string) || 'Product_Specification.pdf';

    let buffer: Buffer;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (pdfBase64) {
      buffer = Buffer.from(pdfBase64, 'base64');
    } else {
      return new NextResponse('File content missing', { status: 400 });
    }

    // 深度清洗安全文件名
    const cleanBase = rawFileName
      .replace(/\.pdf$/i, '')
      .replace(/[^\w\u4e00-\u9fa5\-_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50);

    const asciiFallback = 'Specification.pdf';
    const finalName = `${cleanBase || 'Product_Specification'}.pdf`;
    const encodedName = encodeURIComponent(finalName);

    // 标准 RFC 6266 Content-Disposition，浏览器网络层强制保存为 .pdf
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodedName}`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || 'Download error', { status: 500 });
  }
}
