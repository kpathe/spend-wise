import {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
} from "../controllers/user.controllers.js";
import { Router } from "express";

const userRouter = Router();

userRouter.post("/signup", handleUserSignup);
userRouter.post("/login", handleUserLogin);
userRouter.post("/logout", handleUserLogout);

export default userRouter;
