import { z } from "zod";

export const createCourseSchema = z.object({
  meta: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    tier: z.string().min(1, "Tier is required"),
    targetDeficit: z.string().min(1, "Target Deficit is required"),
    coverImageUrl: z.string().min(1, "Cover Image is required"),
  }),
  price: z.number().min(0, "Price is required"),
  isActive: z.boolean().optional(),
});

export const updateCourseSchema = z.object({
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      tier: z.string().optional(),
      targetDeficit: z.string().optional(),
      coverImageUrl: z.string().optional(),
    })
    .optional(),
  price: z.number().optional(),
  isActive: z.boolean().optional(),
});
