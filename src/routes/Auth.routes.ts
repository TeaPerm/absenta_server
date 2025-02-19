import { userController } from "../controller/User.controller";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", userController.register);
authRouter.post("/login", userController.login);

export default authRouter;