import { NextResponse } from 'next/server';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client, { ensureBucketExists } from '@/lib/s3';
import { withAuth } from '@/lib/auth-utils';
import { dbRateLimit } from '@/lib/rate-limit';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const execAsync = promisify(exec);

async function checkFFmpeg(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

async function processHlsSlices(
  buffer: Buffer, 
  pathVal: string, 
  bucketName: string
): Promise<string | null> {
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    console.warn('[Upload HLS] FFmpeg not found on this system, fallback to direct MP4 upload.');
    return null;
  }

  const uuid = crypto.randomUUID();
  const tempDir = path.join(os.tmpdir(), `hls-${uuid}`);
  
  try {
    // 1. Create temporary directory and write raw MP4 input
    await fs.mkdir(tempDir, { recursive: true });
    const inputPath = path.join(tempDir, 'input.mp4');
    await fs.writeFile(inputPath, buffer);

    // 2. Perform FFmpeg HLS conversion (3s per slice, limited to 1 thread for CPU protection)
    const ffmpegCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -c:a aac -threads 1 -map 0 -f hls -hls_time 3 -hls_list_size 0 -hls_segment_filename "${path.join(tempDir, 'segment_%03d.ts')}" "${path.join(tempDir, 'playlist.m3u8')}"`;
    await execAsync(ffmpegCmd);

    // 3. Scan generated slices
    const files = await fs.readdir(tempDir);
    const m3u8File = files.find(f => f.endsWith('.m3u8'));
    if (!m3u8File) throw new Error('FFmpeg failed: no playlist.m3u8 found.');

    // 4. Upload all slices & playlist to storage bucket
    const targetFolder = `${pathVal}/${uuid}`;
    for (const file of files) {
      if (file === 'input.mp4') continue;
      const filePath = path.join(tempDir, file);
      const fileBuffer = await fs.readFile(filePath);
      const fileKey = `${targetFolder}/${file}`;
      
      const isM3u8 = file.endsWith('.m3u8');
      const isTs = file.endsWith('.ts');
      
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: isM3u8 
          ? 'application/vnd.apple.mpegurl' 
          : isTs 
            ? 'video/MP2T' 
            : 'application/octet-stream',
      });
      await s3Client.send(putCommand);
    }

    // 5. Return target index path
    return `${bucketName}/${targetFolder}/playlist.m3u8`;
  } catch (err) {
    console.error('[Upload HLS] Error during FFmpeg processing:', err);
    return null; // Fallback to direct MP4 upload
  } finally {
    // Cleanup temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

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

export const POST = withAuth('editor', async (request: Request) => {
  try {
    // 1. Parse body immediately to consume network stream and prevent Socket timeout/cutoffs
    const formData = await request.formData();

    // 2. Rate limit check
    const ip = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimitResult = await dbRateLimit(ip, '/api/upload', 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 3. Bucket availability assurance
    const bucketName = process.env.STORAGE_BUCKET || 'heovose-assets';
    await ensureBucketExists(bucketName);

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

    // Try processing MP4 as HLS slices; fallback to direct storage upload on failure or absence of FFmpeg
    let publicUrl = '';
    let isSliced = false;
    if (fileExtension === 'mp4') {
      const hlsUrl = await processHlsSlices(buffer, pathVal, bucketName);
      if (hlsUrl) {
        publicUrl = hlsUrl;
        isSliced = true;
      }
    }

    if (!isSliced) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(command);
      publicUrl = `${bucketName}/${fileName}`;
    }

    return NextResponse.json({ 
      url: publicUrl,
      fileName: isSliced ? `${pathVal}/${publicUrl.split('/').slice(-2)[0]}/playlist.m3u8` : fileName,
      brightness: brightness
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
});
