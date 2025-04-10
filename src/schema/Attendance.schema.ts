import { z } from "zod";

const studentAttendanceSchema = z.object({
    student_name: z.string(),
    neptun_code: z.string(),
    status: z.enum(['Megjelent', 'Nem jelent meg', "Késett", "Igazoltan távol"])
});

export const attendanceCreateSchema = z
    .object({
        course_id: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
            message: "Invalid course ID format"
        }),
        date: z.coerce.date(),
        students: z.array(studentAttendanceSchema).min(1, "At least one student is required")
    })
    .strict();

export const attendanceUpdateSchema = z
    .object({
        date: z.coerce.date().optional(),
        students: z.array(studentAttendanceSchema).optional(),
        status: z.enum(['uploaded', 'not_uploaded']).optional()
    })
    .strict();

export type AttendanceCreateData = z.infer<typeof attendanceCreateSchema>;
export type AttendanceUpdateData = z.infer<typeof attendanceUpdateSchema>;
