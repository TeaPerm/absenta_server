import mongoose from "mongoose";

export interface CourseData {
    name: string;
    user_id: mongoose.Types.ObjectId;
    university: string;
    students: {
        neptun_code: string;
        name: string;
    }[];
}


// name: { type: String, required: true },
// user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// university: { type: Object.keys(universities), required: true },
// students: [{
//     neptun_code: { type: String, required: true, unique: true },
// }],
// }, { timestamps: true });
