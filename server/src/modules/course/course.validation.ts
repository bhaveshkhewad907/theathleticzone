import { z } from "zod";

export const createCourseSchema = z.object({
  meta: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    tier: z.enum(["Beginner", "Intermediate", "Advanced"]),
    targetDeficit: z.enum([
      "Strength",
      "Power",
      "Mobility",
      "Technique",
      "Seasonal",
    ]),
    coverImageUrl: z.string().min(1, "Cover Image is required"),
    videoUrl: z.string().optional(), // 🚀 Whitelisted the Intro Reel URL
  }),
});

export const updateCourseSchema = z.object({
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      tier: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
      targetDeficit: z
        .enum(["Strength", "Power", "Mobility", "Technique", "Seasonal"])
        .optional(),
      coverImageUrl: z.string().optional(),
      videoUrl: z.string().optional(), // 🚀 Whitelisted the Intro Reel URL
    })
    .optional(),
  isDeleted: z.boolean().optional(),
});
