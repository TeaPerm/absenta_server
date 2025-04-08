import { Router } from "express";
import { courseController } from "@/controller/Course.controller";
import { verifyToken } from "@/middleware/Auth.middleware";

const courseRouter = Router();

courseRouter.get("/:id", verifyToken, courseController.getCourse);
courseRouter.post("/", verifyToken, courseController.createCourse);
courseRouter.put("/:id", verifyToken, courseController.updateCourse);
courseRouter.delete("/:id", verifyToken, courseController.deleteCourse);
courseRouter.get("/:id/stats", verifyToken, courseController.getCourseStats);

export default courseRouter;