import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Lazy load here too!
const getS3Client = () => {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
};

export const getPresignedUrl = async (objectKey: string) => {
  if (!objectKey) return "";

  const key = objectKey.includes(".dev/")
    ? objectKey.split(".dev/")[1]
    : objectKey;

  const s3Client = getS3Client(); // Load it!
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return objectKey;
  }
};
