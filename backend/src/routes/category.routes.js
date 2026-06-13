import {
  handleCreateCategory,
  handleGetCategory,
  handleGetCategories,
} from "../controllers/category.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const categoryRouter = Router();

categoryRouter.get("/:categoryId", handleGetCategory);
categoryRouter.get("/", handleGetCategories);
categoryRouter.post("/", handleCreateCategory);

export default categoryRouter;
