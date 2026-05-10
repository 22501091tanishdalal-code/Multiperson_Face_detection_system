import { z } from "zod";

export const AttendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  rollNo: z.string().regex(/^\d{2}$/, "Roll No must be 2 digits"),
  inTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM").optional(),
  outTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM").optional(),
  status: z.enum(["Present", "Absent"]),
});

export type AttendanceInput = z.infer<typeof AttendanceSchema>;
