import { CourseData } from "@/interface/Course.interface";
import { TokenRequest } from "@/interface/Request.types";
import { excludedFields } from "@/lib/utils";
import Attendance from "@/model/Attendance.model";
import { Course } from "@/model/Course.model";
import { User } from "@/model/User.model";
import { courseCreateSchema, courseUpdateSchema } from "@/schema/Course.schema";
import { Response } from "express";
import { ZodError } from "zod";

export const courseController = {

    getCourse: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const course = await Course.findById(req.params.id).select(excludedFields);
            if (!course) {
                res.status(404).json({ error: `Course not found: ${course}` });
                return;
            }

            if (!course.user_id.equals(req.userId)) {
                res.status(403).json({ error: "You do not have acces to this course." });
                return;
            }

            // Sort students alphabetically by name
            const sortedCourse = {
                ...course.toObject(),
                students: [...course.students].sort((a, b) => a.name.localeCompare(b.name))
            };

            res.status(200).json(sortedCourse);
            return;
        } catch (error) {
            res.status(500).json({ error: "Failed to get course", message: (error as Error).message });
        }
    },

    createCourse: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            if (!req.userId) {
                res.status(401).json({ error: "Access denied" });
                return;
            }
            const courseData = req.body as CourseData;

            const parsed = courseCreateSchema.safeParse(courseData);
            if (!parsed.success) {
                res.status(400).json({ errors: (parsed.error as ZodError).issues });
                return;
            }

            const user = await User.findById(req.userId);
            if (!user || !user.university.includes(courseData.university)) {
                res.status(403).json({ error: "User does not belong to the specified university" });
                return;
            }


            courseData.user_id = req.userId;

            const course = new Course(courseData);
            await course.save();

            res.status(201).json({ message: "Course created successfully" });
            return;
        } catch (error) {
            res.status(500).json({ error: "Course creation failed", message: (error as Error).message });
        }
    },

    updateCourse: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            if (!req.userId) {
                res.status(401).json({ error: "Access denied" });
                return;
            }

            const course = await Course.findById(req.params.id);
            if (!course) {
                res.status(404).json({ error: "Course not found" });
                return;
            }

            if (!course.user_id.equals(req.userId)) {
                res.status(403).json({ error: "You do not have access to this course" });
                return;
            }

            // Validate the update data
            const parsed = courseUpdateSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ errors: (parsed.error as ZodError).issues });
                return;
            }

            // Update the course with the new data
            const updatedCourse = await Course.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            res.status(200).json({
                message: "Course updated successfully",
                course: updatedCourse
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Failed to update course", 
                message: (error as Error).message 
            });
        }
    },

    deleteCourse: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            if (!req.userId) {
                res.status(401).json({ error: "Access denied" });
                return;
            }

            const course = await Course.findById(req.params.id);
            if (!course) {
                res.status(404).json({ error: "Course not found" });
                return;
            }

            if (!course.user_id.equals(req.userId)) {
                res.status(403).json({ error: "You do not have access to this course" });
                return;
            }

            // Delete all attendance records associated with this course
            await Attendance.deleteMany({ course_id: req.params.id });

            // Delete the course
            await Course.findByIdAndDelete(req.params.id);

            res.status(200).json({
                message: "Course and associated attendance records deleted successfully"
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Failed to delete course", 
                message: (error as Error).message 
            });
        }
    },

    getCourseStats: async (req: TokenRequest, res: Response): Promise<void> => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                res.status(404).json({ error: "Course not found" });
                return;
            }

            if (!course.user_id.equals(req.userId)) {
                res.status(403).json({ error: "You do not have access to this course" });
                return;
            }

            // Get all attendance records for this course
            const attendances = await Attendance.find({ course_id: req.params.id });
            const totalSessions = attendances.length;

            // Initialize stats for each student in the course
            const studentStats = new Map();
            
            course.students.forEach(student => {
                studentStats.set(student.name, {
                    student_name: student.name,
                    neptun_code: student.neptun_code,
                    totalSessions,
                    attended: 0,
                    missed: 0,
                    late: 0,
                    excused: 0
                });
            });

            // process each attendance record
            attendances.forEach((attendance: any) => {
                if (attendance.students && Array.isArray(attendance.students)) {
                    attendance.students.forEach((student: any) => {
                        const stats = studentStats.get(student.student_name);
                        
                        if (stats) {
                            if (student.status === 'Megjelent') {
                                stats.attended++;
                            } else if (student.status === 'Nem jelent meg') {
                                stats.missed++;
                            } else if (student.status === 'Késett') {
                                stats.late++;
                            } else if (student.status === 'Igazoltan távol') {
                                stats.excused++;
                            }
                        }
                    });
                }
            });

            const statsArray = Array.from(studentStats.values())
                .sort((a, b) => a.student_name.localeCompare(b.student_name));

            res.status(200).json({
                courseName: course.name,
                totalSessions,
                students: statsArray
            });
        } catch (error) {
            res.status(500).json({ 
                error: "Failed to fetch course statistics", 
                message: (error as Error).message 
            });
        }
    }
};
