import {
  handleCreateCategory,
  handleGetCategory,
  handleGetCategories,
} from "../controllers/category.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const categoryRouter = Router();

categoryRouter.get("/:categoryId", handleGetCategory);
categoryRouter.get("/", verifyJWT, handleGetCategories);
categoryRouter.post("/", verifyJWT, handleCreateCategory);

export default categoryRouter;
