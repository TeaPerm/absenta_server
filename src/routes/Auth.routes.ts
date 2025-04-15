import { verifyToken } from "@/middleware/Auth.middleware";
import { userController } from "../controller/User.controller";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", userController.register);
authRouter.post("/login", userController.login);
authRouter.get("/user", verifyToken , userController.getUser);
authRouter.get("/user/courses", verifyToken , userController.getCourses);
authRouter.get("/user/courses/:university", verifyToken , userController.getCoursesByUniversity);
authRouter.put("/user/university", verifyToken , userController.updateUniversities);
authRouter.post("/user/university", verifyToken , userController.addUniversity);

export default authRouter;