import {
  handleUserLogin,
  handleUserSignup,
} from "../controllers/user.controllers.js";
import { Router } from "express";

const userRouter = Router();

userRouter.post("/signup", handleUserSignup);
userRouter.post("/login", handleUserLogin);

export default userRouter;
