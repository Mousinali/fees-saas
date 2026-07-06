import { z } from "zod";

export const CourseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Course name is required"),

  description: z
    .string()
    .optional(),

  status: z
    .enum(["active", "inactive"])
    .default("active"),
});