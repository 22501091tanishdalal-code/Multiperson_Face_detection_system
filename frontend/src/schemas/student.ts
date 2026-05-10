import { z } from "zod";

export const StudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  rollNo: z.string().regex(/^\d{2}$/, "Roll No must be exactly 2 digits"),
  className: z.string().min(1, "Class is required"),
  email: z.string().email("Invalid email").optional(),
  photoUrl: z.string().url("Invalid URL").optional(),
});

export type StudentInput = z.infer<typeof StudentSchema>;
