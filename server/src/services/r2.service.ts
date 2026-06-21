import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";

const getS3Client = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    logger.error("CRITICAL ERROR: Cloudflare R2 Credentials missing.", {
      service: "R2Service",
    });
    throw new Error("Cloudflare R2 Credentials missing");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
};

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

// 🛡️ Merged from legacy s3.ts: Gets viewable signed URL
export const getPresignedUrl = async (objectKey: string) => {
  if (!objectKey) return "";

  const key = objectKey.includes(".dev/")
    ? objectKey.split(".dev/")[1]
    : objectKey;
  const s3Client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 14400 });
  } catch (error: unknown) {
    logger.error("Failed to generate Presigned URL", {
      error: (error as Error).message,
    });
    return objectKey;
  }
};

export const deleteFileFromR2 = async (fileKey: string) => {
  try {
    const s3Client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
    });
    await s3Client.send(command);
    logger.info(`Deleted file from R2 -> ${fileKey}`, {
      event: "R2_DELETE_SUCCESS",
    });
  } catch (error: unknown) {
    logger.error(`Could not delete file from R2 -> ${fileKey}`, {
      error: (error as Error).message,
    });
  }
};

export const uploadBufferToR2 = async (
  fileBuffer: Buffer,
  mimetype: string,
  folder: string = "avatars",
) => {
  const s3Client = getS3Client();
  const extension = mimetype.split("/")[1] || "jpg";
  const key = `${folder}/${uuidv4()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);
  return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
};
