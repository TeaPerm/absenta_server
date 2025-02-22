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
    students: [studentSchema],
}, { timestamps: true });

export const Course = mongoose.model('Course', courseModel);

// const mongoose = require('mongoose');

// // Hallgató model
// const StudentSchema = new mongoose.Schema({
//     neptunCode: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true }
// });

// const Student = mongoose.model('Student', StudentSchema);

// // Kurzus model
// const CourseSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     code: { type: String, required: true, unique: true },
//     instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
//     students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
// });

// const Course = mongoose.model('Course', CourseSchema);

// // Oktató model
// const InstructorSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true }
// });

// const Instructor = mongoose.model('Instructor', InstructorSchema);

// // Jelenléti ív model
// const AttendanceSheetSchema = new mongoose.Schema({
//     course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
//     date: { type: Date, required: true },
//     imagePath: { type: String, required: true },
//     processed: { type: Boolean, default: false }
// });

// const AttendanceSheet = mongoose.model('AttendanceSheet', AttendanceSheetSchema);

// // Jelenlét adat model
// const AttendanceRecordSchema = new mongoose.Schema({
//     sheet: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSheet', required: true },
//     student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
//     present: { type: Boolean, required: true }
// });

// const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);

// module.exports = { Student, Course, Instructor, AttendanceSheet, AttendanceRecord };
