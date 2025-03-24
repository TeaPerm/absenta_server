import { z } from "zod";

export const attendanceCreateSchema = z
    .object({
        course_id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
            message: "Invalid course ID format"
        }),
        date: z.coerce.date()
    })
    .strict();

export type AttendanceCreateData = z.infer<typeof attendanceCreateSchema>;
