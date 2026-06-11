import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const filePath = resolvedParams.path.join('/');
  
  const endpoint = process.env.STORAGE_ENDPOINT || 'localhost';
  const port = process.env.STORAGE_PORT || '9000';
  const protocol = process.env.STORAGE_USE_SSL === 'true' ? 'https' : 'http';
  
  // 构建内网 MinIO 的直连 URL
  const targetUrl = `${protocol}://${endpoint}:${port}/${filePath}`;
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch asset from storage: ${response.statusText}`, {
        status: response.status,
      });
    }
    
    // 转发资源头信息
    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const cacheControl = response.headers.get('cache-control');
    
    if (contentType) headers.set('content-type', contentType);
    if (contentLength) headers.set('content-length', contentLength);
    if (cacheControl) headers.set('cache-control', cacheControl);
    
    // 允许跨域（CORS）
    headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:9002');
    headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Failed to proxy storage asset:', error);
    return new NextResponse(`Internal Storage Proxy Error: ${error.message}`, {
      status: 500,
    });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:9002');
  headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  return new NextResponse(null, {
    status: 204,
    headers,
  });
}
