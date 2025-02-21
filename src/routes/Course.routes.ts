import { Router } from "express";
import { courseController } from "@/controller/Course.controller";
import { verifyToken } from "@/middleware/Auth.middleware";

const courseRouter = Router();

courseRouter.get("/:id", verifyToken, courseController.getCourse);
courseRouter.post("/", verifyToken, courseController.createCourse);

export default courseRouter;