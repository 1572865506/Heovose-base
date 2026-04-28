const { S3Client, PutBucketPolicyCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Client = new S3Client({
  endpoint: `http://${process.env.STORAGE_ENDPOINT}:${process.env.STORAGE_PORT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.STORAGE_SECRET_KEY || "minio_password",
  },
  forcePathStyle: true,
});

async function main() {
  const bucketName = process.env.STORAGE_BUCKET || "heovose-assets";
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

  try {
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    }));
    console.log(`✅ Success! Bucket "${bucketName}" is now public.`);
  } catch (error) {
    console.error("❌ Failed to set policy:", error);
  }
}

main();
