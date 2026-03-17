import { z } from "zod";

export const createSportSchema = z.object({
  name: z.string().min(2, "Sport name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
});
