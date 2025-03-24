import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    date: {
        type: Date,
        required: true,
    },
    attendanceImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        required: true
    },
    status: {
        type: String,   
        enum: ['uploaded', 'not_uploaded'],
        default: 'not_uploaded'
    },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;