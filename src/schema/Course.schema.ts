import { z } from "zod";

export const courseCreateSchema = z
    .object({
        name: z.string().min(1),
        university: z.string(),
        students: z.array(
            z.object({
                neptun_code: z.string().length(6, "Neptun code must be exactly 6 characters"),
                name: z.string().min(1),
            })
        ),
    })
    .strict();