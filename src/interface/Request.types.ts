import { Request } from "express";
import mongoose from "mongoose";

export interface TokenRequest extends Request {
    userId?: mongoose.Types.ObjectId;
}
