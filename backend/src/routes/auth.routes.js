import {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
  handleRefreshToken,
  handleGetCurrentUser,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const authRouter = Router();
authRouter.post("/signup", handleUserSignup);
authRouter.post("/login", handleUserLogin);
authRouter.post("/refresh", handleRefreshToken);
authRouter.post("/logout", handleUserLogout);
authRouter.get("/me", verifyJWT, handleGetCurrentUser);

export default authRouter;
