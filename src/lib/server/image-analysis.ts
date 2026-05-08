import sharp from 'sharp';
import s3Client from '@/lib/s3';
import { GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * Extracts the S3 Key from a path or URL
 */
function extractKey(path: string): string {
  if (!path) return '';
  const bucketName = process.env.STORAGE_BUCKET || 'heovose-assets';
  
  // If it's a URL, extract the part after the bucket
  // Example: heovose-assets/uploads/123.jpg -> uploads/123.jpg
  if (path.startsWith(bucketName + '/')) {
    return path.slice(bucketName.length + 1);
  }
  
  // If it's an absolute URL, try to find the bucket name
  if (path.startsWith('http')) {
    const parts = path.split(`/${bucketName}/`);
    if (parts.length > 1) return parts[1];
  }

  return path;
}

/**
 * Calculates the perceived brightness of an image stored in MinIO.
 * Returns a value between 0 (black) and 255 (white).
 */
export async function calculateImageBrightness(imagePathOrUrl: string): Promise<number | null> {
  if (!imagePathOrUrl || imagePathOrUrl.startsWith('data:')) return null;

  try {
    const bucketName = process.env.STORAGE_BUCKET || 'heovose-assets';
    const key = extractKey(imagePathOrUrl);

    if (!key) return null;

    // 1. Get the image buffer from S3
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (!response.Body) return null;

    const buffer = Buffer.from(await response.Body.transformToByteArray());

    // 2. Use sharp to calculate average brightness
    // Resize to a small version to speed up analysis
    const stats = await sharp(buffer)
      .resize(40, 40, { fit: 'cover' })
      .stats();

    // Sharp's stats gives us the mean of each channel (r: 0, g: 1, b: 2)
    const r = stats.channels[0].mean;
    const g = stats.channels[1].mean;
    const b = stats.channels[2].mean;

    // HSP (Highly Sensitive Poo) color model for perceived brightness
    const brightness = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );

    return brightness;
  } catch (error) {
    console.error(`Failed to calculate brightness for ${imagePathOrUrl}:`, error);
    return null;
  }
}

/**
 * Helper to analyze a buffer directly (useful during upload)
 */
export async function calculateBufferBrightness(buffer: Buffer): Promise<number | null> {
  try {
    const stats = await sharp(buffer)
      .resize(40, 40, { fit: 'cover' })
      .stats();

    const r = stats.channels[0].mean;
    const g = stats.channels[1].mean;
    const b = stats.channels[2].mean;

    const brightness = Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );

    return brightness;
  } catch (error) {
    console.error('Failed to calculate buffer brightness:', error);
    return null;
  }
}
