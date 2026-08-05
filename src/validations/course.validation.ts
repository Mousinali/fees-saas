import { z } from "zod";

export const CourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Course name is required"),

  description: z
    .string()
    .optional(),

  duration: z
    .string()
    .optional(),

  defaultFee: z.coerce
    .number()
    .min(0, "Fee must be greater than or equal to 0"),

  status: z
    .enum(["active", "inactive"])
    .default("active"),

  isEmiAvailable: z.boolean().optional().default(false),
  feeType: z.enum(["monthly", "total"]).optional().default("total"),
  emiType: z.enum(["monthly", "quarterly", "yearly"]).optional().nullable(),
  emiDuration: z.coerce.number().optional().nullable(),
});