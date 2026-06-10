import {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
  handleChangePassword,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const userRouter = Router();

userRouter.post("/signup", handleUserSignup);
userRouter.post("/login", handleUserLogin);
userRouter.post("/logout", verifyJWT, handleUserLogout);
userRouter.post("/change-password", verifyJWT, handleChangePassword);

export default userRouter;
