import { z } from "zod";

export const courseCreateSchema = z
    .object({
        name: z.string().min(1, "Course name is required"),
        university: z.string().min(1, "University is required"),
        students: z.array(
            z.object({
                neptun_code: z.string().length(6, "Neptun code must be exactly 6 characters"),
                name: z.string().min(1, "Student name is required"),
            })
        ),
    })
    .strict();

export const courseUpdateSchema = z
    .object({
        name: z.string().min(1).optional(),
        university: z.string().optional(),
        students: z.array(
            z.object({
                neptun_code: z.string().length(6, "Neptun code must be exactly 6 characters"),
                name: z.string().min(1),
            })
        ).optional()
    })
    .strict();

export type CourseCreateData = z.infer<typeof courseCreateSchema>;
export type CourseUpdateData = z.infer<typeof courseUpdateSchema>;