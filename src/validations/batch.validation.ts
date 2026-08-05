import { z } from "zod";

export const BatchSchema = z.object({
  courseId: z.string().min(1, "Course is required"),

  name: z.string().trim().min(2, "Batch name is required"),

  status: z.enum(["active", "inactive"]),
});