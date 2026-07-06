import { z } from "zod";

export const RegisterSchema = z
  .object({
    accountType: z.enum(["teacher", "coaching_center"]),

    fullName: z.string().min(3, "Full name is required"),

    coachingName: z.string().optional(),

    email: z.email(),

    phone: z
      .string()
      .min(10)
      .max(15),

    password: z
      .string()
      .min(6),

    confirmPassword: z
      .string()
      .min(6),

    branches: z.array(z.string().min(1, "Branch name cannot be empty")).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });