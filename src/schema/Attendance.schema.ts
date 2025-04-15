import { z } from "zod";

const studentAttendanceSchema = z.object({
    student_name: z.string(),
    neptun_code: z.string(),
    status: z.enum(['Megjelent', 'Nem jelent meg', "Késett", "Igazoltan távol"])
});

export const attendanceCreateSchema = z
    .object({
        course_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
        date: z.coerce.date(),
        students: z.array(
            z.object({
                student_name: z.string().min(1, "Student name is required"),
                neptun_code: z.string().length(6, "Neptun code must be exactly 6 characters"),
                status: z.enum(['Megjelent', 'Nem jelent meg', 'Késett', 'Igazoltan távol'], {
                    errorMap: () => ({ message: "Invalid attendance status" })
                })
            })
        )
    })
    .strict();

export const attendanceUpdateSchema = z
    .object({
        students: z.array(
            z.object({
                student_name: z.string().min(1, "Student name is required"),
                neptun_code: z.string().length(6, "Neptun code must be exactly 6 characters"),
                status: z.enum(['Megjelent', 'Nem jelent meg', 'Késett', 'Igazoltan távol'], {
                    errorMap: () => ({ message: "Invalid attendance status" })
                })
            })
        ).optional(),
        status: z.enum(['uploaded', 'not_uploaded']).optional()
    })
    .strict();

export type AttendanceCreateData = z.infer<typeof attendanceCreateSchema>;
export type AttendanceUpdateData = z.infer<typeof attendanceUpdateSchema>;
