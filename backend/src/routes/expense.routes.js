import {
  handleCreateExpense,
  handleEditExpense,
  handleDeleteExpense,
} from "../controllers/expense.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const expenseRouter = Router();

expenseRouter.post("/", verifyJWT, handleCreateExpense);
expenseRouter.patch("/:expenseId", verifyJWT, handleEditExpense);
expenseRouter.delete("/:expenseId", verifyJWT, handleDeleteExpense);

export default expenseRouter;
