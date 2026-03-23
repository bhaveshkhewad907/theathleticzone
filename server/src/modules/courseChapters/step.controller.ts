import { RequestHandler } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import Step from "./step.model"; // The schema we created earlier

// Configure Cloudflare R2 Client
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

// 1. Give the frontend a secure URL to upload the video directly to R2
export const generateUploadUrl: RequestHandler = async (req, res, next) => {
  try {
    const { contentType, extension } = req.body;

    // Generate a random secure filename
    const uniqueFileName = `${crypto.randomBytes(16).toString("hex")}.${extension}`;
    const objectKey = `training-steps/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: contentType,
    });

    // The URL is valid for exactly 15 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    res.status(200).json({
      success: true,
      data: {
        uploadUrl: signedUrl,
        // This is where the video will live permanently once uploaded
        publicUrl: `${process.env.R2_PUBLIC_DOMAIN}/${objectKey}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Save the metadata to MongoDB after the frontend finishes uploading
export const createStep: RequestHandler = async (req, res, next) => {
  try {
    const { title, type, videoUrl } = req.body;

    const newStep = await Step.create({
      title,
      type,
      videoUrl,
    });

    res.status(201).json({
      success: true,
      data: newStep,
    });
  } catch (error) {
    next(error);
  }
};

// GET: Fetch all available steps for the Protocol Builder
export const getSteps: RequestHandler = async (req, res, next) => {
  try {
    const steps = await Step.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    next(error);
  }
};
