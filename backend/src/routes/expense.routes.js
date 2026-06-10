import { handleCreateExpense } from "../controllers/expense.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const expenseRouter = Router();

expenseRouter.post("/create", verifyJWT, handleCreateExpense);

export default expenseRouter;
