import { z } from 'zod';
import universities from "@/lib/universities";

export const userRegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    university: z.string().refine((val) => Object.keys(universities).includes(val), {
      message: "Invalid university abbreviation"
    })
  })
  .strict();

export const userLoginSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
  .strict();

export const userUpdateUniversitiesSchema = z
  .object({
    universities: z.array(z.string().refine((val) => Object.keys(universities).includes(val), {
      message: "Invalid university abbreviation"
    })).min(1, "At least one university is required")
  })
  .strict();

export type UserRegisterData = z.infer<typeof userRegisterSchema>;
export type UserLoginData = z.infer<typeof userLoginSchema>;
export type UserUpdateUniversitiesData = z.infer<typeof userUpdateUniversitiesSchema>;