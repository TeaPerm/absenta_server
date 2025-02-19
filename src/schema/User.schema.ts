import { z } from 'zod';

export const userRegisterSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    university: z.array(z.string()),
  })
  .strict();

export const userLoginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();