import {
  handleCreateExpense,
  handleEditExpense,
  handleDeleteExpense,
  handleGetExpenses,
  handleGetExpenseSummary,
} from "../controllers/expense.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const expenseRouter = Router();

expenseRouter.post("/", verifyJWT, handleCreateExpense);
expenseRouter.patch("/:expenseId", verifyJWT, handleEditExpense);
expenseRouter.delete("/:expenseId", verifyJWT, handleDeleteExpense);
expenseRouter.get("/", verifyJWT, handleGetExpenses);
expenseRouter.get("/summary", verifyJWT, handleGetExpenseSummary);

export default expenseRouter;
