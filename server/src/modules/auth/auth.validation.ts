import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // 🛡️ THE FIX: sportId is now strictly required for all registrations
  // Since only athletes use this page, we remove .optional()
  sportId: z
    .string({ message: "Technical sport sector is required" })
    .min(1, "Please select a sport sector"),
});
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const inviteCoachSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invalid token"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
