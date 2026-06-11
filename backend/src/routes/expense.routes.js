import {
  handleCreateExpense,
  handleEditExpense,
} from "../controllers/expense.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const expenseRouter = Router();

expenseRouter.post("/create", verifyJWT, handleCreateExpense);
expenseRouter.patch("/edit/:expenseId", verifyJWT, handleEditExpense);

export default expenseRouter;
