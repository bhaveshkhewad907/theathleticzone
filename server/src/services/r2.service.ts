import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid"; // 🚀 Added UUID for safe random filenames

// 🚀 LAZY LOAD S3 CLIENT
const getS3Client = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!accountId) {
    console.error(
      "CRITICAL ERROR: CLOUDFLARE_ACCOUNT_ID is still undefined at runtime!",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
};

// 🛡️ Generates a secure URL for the frontend to UPLOAD large files directly (Courses)
export const generatePresignedUrl = async (
  fileName: string,
  contentType: string,
  folder: string,
) => {
  const s3Client = getS3Client();
  const fileKey = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileKey}`;

  return { uploadUrl, fileKey, publicUrl };
};

// 🛡️ Generates a secure URL to VIEW private videos
export const generateSecureVideoUrl = async (videoKey: string) => {
  const s3Client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: videoKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 14400 });
};

export const deleteFileFromR2 = async (fileKey: string) => {
  try {
    const s3Client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    console.log(`🗑️ [CLEANUP SUCCESS]: Deleted old file from R2 -> ${fileKey}`);
  } catch (error) {
    console.error(
      `❌ [CLEANUP FAILED]: Could not delete file from R2 -> ${fileKey}`,
      error,
    );
  }
};

// 🚀 NEW: Server-Side Buffer Upload for Avatars (Protects from >2MB files)
export const uploadBufferToR2 = async (
  fileBuffer: Buffer,
  mimetype: string,
  folder: string = "avatars",
) => {
  const s3Client = getS3Client();

  // Create a safe, unique filename
  const extension = mimetype.split("/")[1] || "jpg";
  const key = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  // Return the public URL so you can save it to the User's database record
  return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
};
