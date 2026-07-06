import { z } from "zod";

export const StudentSchema = z.object({
  photo: z.string().optional(),
  fullName: z.string().min(2, "Student name is required").trim(),
  phone: z.string().min(10, "Valid phone number is required").trim(),
  courseId: z.string().min(1, "Course is required"),
  batchId: z.string().min(1, "Batch is required"),
  aadhaarNumber: z.string().optional(),
  guardianPhone: z.string().min(10, "Valid guardian phone number is required").trim(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  // Additional optional fields from previous design
  guardianName: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.coerce.date().optional(),
  customFee: z.union([z.coerce.number().min(0), z.literal(""), z.null()]).optional().transform(e => (e === "" || e === null) ? undefined : e),
});
