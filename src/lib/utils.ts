export const excludedFields : string = "-__v -createdAt -updatedAt -password";


import { User } from "@/model/User.model";
import { TokenRequest } from "@/interface/Request.types";
import { Response } from "express";

export const authenticateUser = async (req: TokenRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ error: "Authentication failed" });
        return null;
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(401).json({ error: "Authentication failed" });
        return null;
    }

    return user;
};