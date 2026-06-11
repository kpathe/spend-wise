import {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const authRouter = Router();
authRouter.post("/signup", handleUserSignup);
authRouter.post("/login", handleUserLogin);
authRouter.post("/logout", verifyJWT, handleUserLogout);

export default authRouter;
