import { z } from "zod";

export const BatchSchema = z.object({
  courseId: z.string().min(1, "Course is required"),

  name: z.string().trim().min(2, "Batch name is required"),

  defaultFee: z.coerce
    .number()
    .min(0, "Fee must be greater than or equal to 0"),

  status: z.enum(["active", "inactive"]),
});