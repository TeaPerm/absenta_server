import mongoose from "mongoose";

export interface CourseData {
    name: string;
    university: string;
    students: Array<{
        neptun_code: string;
        name: string;
    }>;
    user_id: mongoose.Types.ObjectId;
}   