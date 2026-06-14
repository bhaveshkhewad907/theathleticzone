import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  thumbnailUrl: z.string().url(),
  videoUrl: z.string().min(3).optional(),
  price: z.coerce.number().min(0),
});

export const updateCourseSchema = createCourseSchema.partial();
