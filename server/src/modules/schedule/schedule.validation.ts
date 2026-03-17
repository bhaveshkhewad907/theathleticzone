import { z } from "zod";

export const createScheduleSchema = z.object({
  type: z.enum(["GROUP", "ONE_ON_ONE"]),
  sport: z.string(),
  coach: z.string(),
  subscriptionIds: z.array(z.string()).min(1),
  scheduledTime: z.string().min(1),
  meetingLink: z.string().optional(),
  scheduledDate: z.string().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
