import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema({
    student_name: {
        type: String,
        required: true
    },
    neptun_code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Megjelent', 'Nem jelent meg', "Késett", "Igazoltan távol"],
        required: true
    }
});

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
    students: [studentAttendanceSchema],
    status: {
        type: String,   
        enum: ['uploaded', 'not_uploaded'],
        default: 'not_uploaded'
    },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;