import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`,
  region: "us-east-1", // MinIO doesn't care about region but SDK needs it
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || "",
    secretAccessKey: process.env.STORAGE_SECRET_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

export async function ensureBucketExists(bucketName: string) {
  try {
    const { CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } = await import("@aws-sdk/client-s3");
    
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        
        // Set public read policy for MinIO
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        
        await s3Client.send(new PutBucketPolicyCommand({
          Bucket: bucketName,
          Policy: JSON.stringify(policy),
        }));

        // Set CORS policy for MinIO to allow metadata loading (resolution, duration)
        const { PutBucketCorsCommand } = await import("@aws-sdk/client-s3");
        await s3Client.send(new PutBucketCorsCommand({
          Bucket: bucketName,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                AllowedOrigins: ["*"],
                ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
                MaxAgeSeconds: 3000
              }
            ]
          }
        }));
      } else {
        // Even if bucket exists, try to update CORS to be safe
        const { PutBucketCorsCommand } = await import("@aws-sdk/client-s3");
        try {
          await s3Client.send(new PutBucketCorsCommand({
            Bucket: bucketName,
            CORSConfiguration: {
              CORSRules: [
                {
                  AllowedHeaders: ["*"],
                  AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                  AllowedOrigins: ["*"],
                  ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
                  MaxAgeSeconds: 3000
                }
              ]
            }
          }));
        } catch (corsErr) {
          console.error("Non-critical: Error updating CORS on existing bucket:", corsErr);
        }
      }
    }
  } catch (e) {
    console.error("Error ensuring bucket exists:", e);
  }
}

export async function deleteFile(fileName: string) {
  const bucketName = process.env.STORAGE_BUCKET || 'heovose-assets';
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    }));
  } catch (error) {
    console.error("Error deleting file from MinIO:", error);
  }
}

export function getFileUrl(fileName: string) {
  const bucketName = process.env.STORAGE_BUCKET || 'heovose-assets';
  const endpoint = process.env.STORAGE_ENDPOINT || 'localhost';
  const port = process.env.STORAGE_PORT || '9000';
  return `http://${endpoint}:${port}/${bucketName}/${fileName}`;
}

export default s3Client;
