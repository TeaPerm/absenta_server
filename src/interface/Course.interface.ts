import mongoose from "mongoose";

export interface CourseData {
    name: string;
    user_id: mongoose.Types.ObjectId;
    university: string;
    dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string;
    endTime: string;
    location?: string;
    students: {
        neptun_code: string;
        name: string;
    }[];
}   