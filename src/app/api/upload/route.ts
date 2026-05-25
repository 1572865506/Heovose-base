import { NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client, { ensureBucketExists } from '@/lib/s3';
import { auth } from '@/auth';

function verifyMagicBytes(buffer: Buffer, type: string, extension: string): boolean {
  if (buffer.length < 4) return false;
  const hex = buffer.toString('hex', 0, 12).toLowerCase();

  if (hex.startsWith('89504e47')) {
    return type === 'image/png' && extension === 'png';
  }
  if (hex.startsWith('ffd8ff')) {
    return (type === 'image/jpeg' || type === 'image/jpg') && (extension === 'jpg' || extension === 'jpeg');
  }
  if (hex.startsWith('474946')) {
    return type === 'image/gif' && extension === 'gif';
  }
  if (hex.startsWith('25504446')) {
    return type === 'application/pdf' && extension === 'pdf';
  }
  if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') {
    return type === 'image/webp' && extension === 'webp';
  }
  if (hex.slice(8, 16) === '66747970') {
    return type === 'video/mp4' && extension === 'mp4';
  }
  if (hex.startsWith('504b')) {
    const allowedDocTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
      'application/zip'
    ];
    const allowedDocExts = ['docx', 'xlsx', 'doc', 'xls', 'zip'];
    return allowedDocTypes.includes(type) && allowedDocExts.includes(extension);
  }
  if (type === 'image/svg+xml' && extension === 'svg') {
    const textContent = buffer.toString('utf8', 0, Math.min(buffer.length, 500)).toLowerCase();
    return textContent.includes('<svg');
  }
  if (hex.startsWith('d0cf11e0')) {
    return (type === 'application/msword' || type === 'application/vnd.ms-excel') && (extension === 'doc' || extension === 'xls');
  }
  return false;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bucketName = process.env.STORAGE_BUCKET || 'heovose-assets';
  await ensureBucketExists(bucketName);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Sanitize path variable to prevent path traversal
    let pathVal = formData.get('path') as string || 'uploads';
    pathVal = pathVal.replace(/[^a-zA-Z0-9_\-\/]/g, '').replace(/\.+/g, '').replace(/\/+/g, '/');
    if (!pathVal || pathVal === '/') {
      pathVal = 'uploads';
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileExtension = (file.name.split('.').pop() || '').toLowerCase();

    // 1. File size check (Images: 700KB, Other files: 20MB)
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
    const maxSize = isImage ? 700 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      const limitStr = isImage ? '700KB' : '20MB';
      return NextResponse.json({ error: `File size exceeds the ${limitStr} limit` }, { status: 400 });
    }

    // 2. Extension check against whitelist
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'mp4', 'zip'];
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: 'File type extension not allowed' }, { status: 400 });
    }

    // 3. MIME type check against whitelist
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4', 'application/zip'
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file MIME type' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Deep magic bytes verification to prevent renaming attacks (e.g. php to png)
    if (!verifyMagicBytes(buffer, file.type, fileExtension)) {
      return NextResponse.json({ error: 'File signature verification failed' }, { status: 400 });
    }

    // 5. SVG XSS safety scan to prevent malicious scripts, iframes, and onload event handlers
    if (fileExtension === 'svg' || file.type === 'image/svg+xml') {
      const svgText = buffer.toString('utf8');
      const containsScript = /<script/i.test(svgText);
      const containsIframe = /<iframe/i.test(svgText);
      const containsEventHandlers = /on\w+\s*=/i.test(svgText);

      if (containsScript || containsIframe || containsEventHandlers) {
        return NextResponse.json({ error: 'SVG contains malicious content (XSS vector detected)' }, { status: 400 });
      }
    }

    const fileName = `${pathVal}/${crypto.randomUUID()}.${fileExtension}`;

    // Calculate brightness if it's an image
    let brightness: number | null = null;
    if (file.type.startsWith('image/')) {
      const { calculateBufferBrightness } = await import('@/lib/server/image-analysis');
      brightness = await calculateBufferBrightness(buffer);
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Construct the public URL
    const publicUrl = `${bucketName}/${fileName}`;

    return NextResponse.json({ 
      url: publicUrl,
      fileName: fileName,
      brightness: brightness
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
