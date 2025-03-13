import { z } from "zod";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const courseCreateSchema = z
    .object({
        name: z.string().min(1),
        university: z.string(),
        // Schedule fields
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

export type CourseCreateData = z.infer<typeof courseCreateSchema>;