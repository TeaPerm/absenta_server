import { Router } from "express";
import authRouter from "./Auth.routes";
import courseRouter from "./Course.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/course", courseRouter);

export default apiRouter;