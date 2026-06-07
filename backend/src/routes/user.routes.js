import { handleUserSignup } from "../controllers/user.controllers.js";
import { Router } from "express";

const userRouter = Router();

userRouter.post("/signup", handleUserSignup);

export default userRouter;
