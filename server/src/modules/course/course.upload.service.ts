import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// 🚀 LAZY LOAD S3 CLIENT
// This function creates the client ONLY when the upload button is clicked.
// It bypasses the old `../../config/r2` file entirely!
const getS3Client = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!accountId) {
    throw new Error("Missing Env Variable: CLOUDFLARE_ACCOUNT_ID");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // 🚀 CRITICAL FIX: Forces correct Cloudflare URL structure
    forcePathStyle: true,
  });
};

/**
 * Generates a presigned URL for uploading files directly to R2.
 */
export const generatePresignedUrl = async (
  fileName: string,
  contentType: string,
  folder: "videos" | "thumbnails",
) => {
  const fileExtension = fileName.split(".").pop();

  // Dynamic path based on the folder parameter
  const key = `courses/${folder}/${uuidv4()}.${fileExtension}`;

  // 🚀 Load the client right now, safely pulling from the active .env
  const s3Client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // URL valid for 1 hour
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    uploadUrl,
    publicUrl: `${process.env.R2_PUBLIC_DOMAIN}/${key}`,
    fileKey: key, // 🚀 FIX: Renamed to fileKey so AdminCourses.tsx can read it!
  };
};
