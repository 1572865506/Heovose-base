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

    const appUrl = process.env.NEXTAUTH_URL;
    const allowedOrigins = process.env.NODE_ENV === 'production' && appUrl
      ? [appUrl]
      : [appUrl || 'http://localhost:9002', 'http://localhost:3000', 'http://localhost:9002'].filter(Boolean);

    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      }
    }

    // Set public read policy for MinIO
    const policy: any = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    // L-6 生产环境下在 Policy 中对匿名 GetObject 限制必须本站 Referer，以防盗用
    if (process.env.NODE_ENV === 'production' && appUrl) {
      try {
        const domain = new URL(appUrl).hostname;
        policy.Statement[0].Condition = {
          StringLike: {
            "aws:Referer": [
              `https://*.${domain}/*`,
              `http://*.${domain}/*`,
              `${appUrl}/*`
            ]
          }
        };
      } catch (e) {
        console.warn("Invalid NEXTAUTH_URL for S3 Policy Referer:", e);
      }
    }

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
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: allowedOrigins,
            ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
            MaxAgeSeconds: 3000
          }
        ]
      }
    }));
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
