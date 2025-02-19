import { Router } from "express";
import authRouter from "./Auth.routes";

const apiRouter = Router();

apiRouter.get("/example", (req, res) => {
    res.send("Example route");
});
apiRouter.use("/auth", authRouter);

export default apiRouter;