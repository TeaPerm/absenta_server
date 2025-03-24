import { Router } from "express";
import authRouter from "./Auth.routes";
import courseRouter from "./Course.routes";
import attendanceRouter from "./Attendance.routes";
const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/courses", courseRouter);
apiRouter.use("/attendance", attendanceRouter);

export default apiRouter;