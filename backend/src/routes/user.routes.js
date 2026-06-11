import { handleChangePassword } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const userRouter = Router();
userRouter.patch("/me/password", verifyJWT, handleChangePassword);

export default userRouter;
