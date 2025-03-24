import { Router } from "express";
import multer from "multer";
import { verifyToken } from "@/middleware/Auth.middleware";
import { attendanceController } from "@/controller/Attendance.controller";

const attendanceRouter = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

attendanceRouter.post("/", verifyToken, upload.single('attendanceImage'), attendanceController.createAttendance);
attendanceRouter.get("/image/:imageId", attendanceController.getImage);
attendanceRouter.get("/course/:courseId", verifyToken, attendanceController.getAttendancesByCourse);

export default attendanceRouter;