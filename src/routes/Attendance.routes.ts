import { Router } from "express";
import multer from "multer";
import { verifyToken } from "@/middleware/Auth.middleware";
import { attendanceController } from "@/controller/Attendance.controller";

const attendanceRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        fieldSize: 2 * 1024 * 1024  // 2MB limit for other fields
    }
});

attendanceRouter.post("/", verifyToken, upload.single('attendanceImage'), attendanceController.createAttendance);
attendanceRouter.get("/image/:imageId", attendanceController.getImage);
attendanceRouter.get("/course/:courseId", verifyToken, attendanceController.getAttendancesByCourse);
attendanceRouter.get("/:id", verifyToken, attendanceController.getAttendanceById);
attendanceRouter.put("/:id", verifyToken, attendanceController.updateAttendance);
attendanceRouter.delete("/:id", verifyToken, attendanceController.deleteAttendance);

export default attendanceRouter;