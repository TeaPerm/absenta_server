import universities from '@/lib/universities';
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    neptun_code: { type: String, required: true },
    name: { type: String, required: true },
}, { _id: false });

const courseModel = new mongoose.Schema({
    name: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    university: {
        type: String,
        validate: {
            validator: function (value: string) {
                return universities.hasOwnProperty(value);
            },
            message: (props: { value: string }) => `${props.value} is not a valid university abbreviation`
        }
    },
    // Schedule fields added directly to the course model
    dayOfWeek: { 
        type: String, 
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: { type: String, required: true }, // eg: 08:00
    endTime: { type: String, required: true },   // eg: 10:00
    location: { type: String, required: false }, 
    students: [studentSchema],
}, { timestamps: true });

export const Course = mongoose.model('Course', courseModel);