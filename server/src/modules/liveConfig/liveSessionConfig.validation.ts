import { z } from "zod";

const planSchema = z.object({
  ONE_MONTH: z.number().min(0),
  THREE_MONTHS: z.number().min(0),
  SIX_MONTHS: z.number().min(0),
  YEARLY: z.number().min(0),
});

export const updatePricingSchema = z.object({
  group: planSchema,
  oneOnOne: planSchema,
});
