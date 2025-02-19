import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@/model/User.model';
import { UserData } from '@/interface/User.interface';
import { userLoginSchema, userRegisterSchema } from '@/schema/User.schema';
import { ZodError } from 'zod';
import { envconfig } from '@/config/env.config';

export const userController = {
    register: async (req: Request, res: Response): Promise<void> => {
        try {
            const userData = req.body as UserData;
            const { name, email, password, university } = userData;

            const parsed = userRegisterSchema.safeParse(userData);
            if (!parsed.success) {
                res.status(400).json({ errors: (parsed.error as ZodError).issues });
                return;
            }

            const foundEmail = await User.findOne({ email: email });

            if (foundEmail) {
                res.status(400).json({ message: "Email is already in use." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ name, email, password: hashedPassword, university });
            await user.save();
            const secretKey = envconfig.auth['jwt-secret'];

            const token = jwt.sign({ userId: user._id.toString() }, secretKey, {
                expiresIn: envconfig.auth['jwt-expiration'],
            });

            res.status(201).json({ message: "User registered successfully", token: token });
        } catch (error) {
            res.status(500).json({ error: "Registration failed", message: (error as Error).message });
        }
    },
    login: async (req: Request, res: Response): Promise<void> => {
        try {
            const userData = req.body as UserData;
            const { email, password } = userData;

            const parsed = userLoginSchema.safeParse(userData);
            if (!parsed.success) {
                res.status(400).json({ errors: parsed.error.issues });
            }

            const user = await User.findOne({ email });
            if (!user) {
                res.status(401).json({ error: "Authentication failed" });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.status(401).json({ error: "Authentication failed" });
            }


            const secretKey = envconfig.auth['jwt-secret'];
            const token = jwt.sign({ userId: user._id }, secretKey, {
                expiresIn: envconfig.auth['jwt-expiration'],
            });

            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ error: "Login failed" });
        }
    },
};
