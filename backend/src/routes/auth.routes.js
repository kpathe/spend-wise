import {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
  handleRefreshToken,
} from "../controllers/auth.controllers.js";
import { Router } from "express";

const authRouter = Router();
authRouter.post("/signup", handleUserSignup);
authRouter.post("/login", handleUserLogin);
authRouter.post("/refresh", handleRefreshToken);
authRouter.post("/logout", handleUserLogout);

export default authRouter;
