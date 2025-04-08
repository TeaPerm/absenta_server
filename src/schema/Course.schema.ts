import { z } from "zod";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const courseCreateSchema = z
    .object({
        name: z.string().min(1),
        university: z.string(),
        dayOfWeek: z.enum(daysOfWeek),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string().optional(),
        students: z.array(
            z.object({
                neptun_code: z.string().length(6, "Neptun code must be exactly 6 characters"),
                name: z.string().min(1),
            })
        )
    })
    .strict()

export const courseUpdateSchema = z
    .object({
        name: z.string().min(1).optional(),
        university: z.string().optional(),
        dayOfWeek: z.enum(daysOfWeek).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        location: z.string().optional(),
        students: z.array(
            z.object({
                neptun_code: z.string().length(6, "Neptun code must be exactly 6 characters"),
                name: z.string().min(1),
            })
        ).optional()
    })
    .strict()

export type CourseCreateData = z.infer<typeof courseCreateSchema>;
export type CourseUpdateData = z.infer<typeof courseUpdateSchema>;