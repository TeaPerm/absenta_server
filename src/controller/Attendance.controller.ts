import { TokenRequest } from "@/interface/Request.types";
import { Response } from "express";
import { Course } from "@/model/Course.model";
import { Image } from "@/model/Image.model";
import Attendance from "@/model/Attendance.model";
import { attendanceCreateSchema } from "@/schema/Attendance.schema";
import { ZodError } from "zod";
import { authenticateUser } from "@/lib/utils";

export const attendanceController = {
    createAttendance: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const user = await authenticateUser(req, res);
            if (!user) return;

            if (!req.file) {
                res.status(400).json({ error: "attendanceImage is required" });
                return;
            }

            if (!req.body.students) {
                res.status(400).json({ error: "students data is required" });
                return;
            }

            const attendanceData = {
                course_id: req.body.course_id,
                date: req.body.date,
                students: JSON.parse(req.body.students)
            };

            const parsed = attendanceCreateSchema.safeParse(attendanceData);
            if (!parsed.success) {
                res.status(400).json({ errors: (parsed.error as ZodError).issues });
                return;
            }

            // Check if course exists and user has access to it
            const course = await Course.findById(attendanceData.course_id);
            if (!course) {
                res.status(404).json({ error: "Course not found" });
                return;
            }

            if (!course.user_id.equals(user._id)) {
                res.status(403).json({ error: "You do not have access to this course" });
                return;
            }

            // Create image record
            const newImage = new Image({
                name: `Attendance-${attendanceData.date}`,
                desc: `Attendance sheet for ${course.name} on ${attendanceData.date}`,
                img: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            });
            await newImage.save();

            // Create attendance record with students
            const attendance = new Attendance({
                course_id: attendanceData.course_id,
                date: new Date(attendanceData.date),
                attendanceImage: newImage,
                students: attendanceData.students,
                status: 'uploaded'
            });
            await attendance.save();

            res.status(201).json({ 
                message: "Attendance created successfully",
                attendance: {
                    id: attendance._id,
                    date: attendance.date,
                    status: attendance.status,
                    students: attendance.students
                }
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Attendance creation failed", 
                message: (error as Error).message 
            });
        }
    },

    getImage: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const image = await Image.findById(req.params.imageId);
                if (!image || !image.img) {
                res.status(404).json({ error: "Image not found" });
                return;
            }

            res.set('Content-Type', image.img.contentType || 'application/octet-stream');
            res.send(image.img.data);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve image" });
        }
    },

    getAttendancesByCourse: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const user = await authenticateUser(req, res);
            if (!user) return;

            const course = await Course.findById(req.params.courseId);
            if (!course) {
                res.status(404).json({ error: "Course not found" });
                return;
            }

            if (!course.user_id.equals(user._id)) {
                res.status(403).json({ error: "You do not have access to this course" });
                return;
            }

            const excludedFields = 'attendanceImage';
            const attendances = await Attendance.find({ course_id: req.params.courseId })
                .populate('attendanceImage', 'name desc')
                .sort({ date: -1 });

            res.status(200).json(attendances);
        } catch (error) {
            res.status(500).json({ 
                error: "Failed to fetch attendances", 
                message: (error as Error).message 
            });
        }
    },

    getAttendanceById: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const user = await authenticateUser(req, res);
            if (!user) return;

            const attendance = await Attendance.findById(req.params.id)
                .populate('attendanceImage', 'name desc')
                .populate('course_id', 'name');

            if (!attendance) {
                res.status(404).json({ error: "Attendance not found" });
                return;
            }

            res.status(200).json(attendance);
        } catch (error) {
            res.status(500).json({ 
                error: "Failed to fetch attendance", 
                message: (error as Error).message 
            });
        }
    },

    updateAttendance: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const user = await authenticateUser(req, res);
            if (!user) return;

            const attendance = await Attendance.findById(req.params.id)
                .populate('course_id');

            if (!attendance) {
                res.status(404).json({ error: "Attendance not found" });
                return;
            }

            const updateData: any = {};
            
            if (req.body.date) updateData.date = req.body.date;
            if (req.body.students) updateData.students = req.body.students;
            if (req.body.status) updateData.status = req.body.status;

            const updatedAttendance = await Attendance.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            ).populate('attendanceImage', 'name desc');

            res.status(200).json({
                message: "Attendance updated successfully",
                attendance: updatedAttendance
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Failed to update attendance", 
                message: (error as Error).message 
            });
        }
    },

    deleteAttendance: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const user = await authenticateUser(req, res);
            if (!user) return;

            const attendance = await Attendance.findById(req.params.id)
                .populate('attendanceImage')
                .populate('course_id');

            if (!attendance) {
                res.status(404).json({ error: "Attendance not found" });
                return;
            }


            // Delete the associated image
            if (attendance.attendanceImage) {
                await Image.findByIdAndDelete(attendance.attendanceImage._id);
            }

            // Delete the attendance record
            await Attendance.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: "Attendance deleted successfully" });
        } catch (error) {
            res.status(500).json({ 
                error: "Failed to delete attendance", 
                message: (error as Error).message 
            });
        }
    }
};
