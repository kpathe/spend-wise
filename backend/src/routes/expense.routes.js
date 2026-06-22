import {
  handleCreateExpense,
  handleEditExpense,
  handleDeleteExpense,
  handleGetExpenses,
  handleGetExpenseSummary,
  handleGetExpense,
} from "../controllers/expense.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const expenseRouter = Router();

expenseRouter.post("/", verifyJWT, handleCreateExpense);
expenseRouter.patch("/:expenseId", verifyJWT, handleEditExpense);
expenseRouter.delete("/:expenseId", verifyJWT, handleDeleteExpense);
expenseRouter.get("/", verifyJWT, handleGetExpenses);
expenseRouter.get("/summary", verifyJWT, handleGetExpenseSummary);
expenseRouter.get("/:expenseId", verifyJWT, handleGetExpense);

export default expenseRouter;
