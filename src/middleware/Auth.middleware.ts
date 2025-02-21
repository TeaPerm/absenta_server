import { envconfig } from '@/config/env.config';
import { TokenRequest } from '@/interface/Request.types';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

interface DecodedToken {
    userId: mongoose.Types.ObjectId;
}

export const verifyToken = (req: TokenRequest, res: Response, next: NextFunction): void => {
    const secretKey = envconfig.auth['jwt-secret'];
    const token = req.header("Authorization");

    if (!token) {
        res.status(401).json({ error: "Access denied, no token given" });
        return
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], secretKey) as DecodedToken;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};