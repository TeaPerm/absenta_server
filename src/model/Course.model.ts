import mongoose, { Schema, Document } from "mongoose";
import universities from '@/lib/universities';

export interface ICourse extends Document {
    name: string;
    university: string;
    students: Array<{
        neptun_code: string;
        name: string;
    }>;
    user_id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const studentSchema = new mongoose.Schema({
    neptun_code: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return v.length === 6;
            },
            message: 'Neptun code must be exactly 6 characters'
        }
    },
    name: {
        type: String,
        required: true
    }
}, { _id: false });

const CourseSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        university: {
            type: String,
            required: true,
            validate: {
                validator: function(v: string) {
                    return Object.keys(universities).includes(v);
                },
                message: 'Invalid university'
            }
        },
        students: [studentSchema],
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        timestamps: true,
    }
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema);