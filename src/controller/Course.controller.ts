import { CourseData } from "@/interface/Course.interface";
import { TokenRequest } from "@/interface/Request.types";
import { excludedFields } from "@/lib/utils";
import { Course } from "@/model/Course.model";
import { User } from "@/model/User.model";
import { courseCreateSchema } from "@/schema/Course.schema";
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

            res.status(200).json(course);
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
    }
};
