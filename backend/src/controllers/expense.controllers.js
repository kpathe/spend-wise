import { Expense } from "../models/expense.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";

// create expense
const handleCreateExpense = asyncHandler(async (req, res) => {
  const { name, amount, type, category, date, note } = req.body;

  if (!name || !amount || !type || !date) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(req.user.userId);

  const expense = await Expense.create({
    name: name,
    amount: amount,
    transactionType: type,
    category: category,
    date: date || Date.now(),
    note: note,
    user: user,
  });

  if (!expense) throw new ApiError(204, "Error creating expense");

  return res
    .status(200)
    .json(new ApiResponse(200, { expense }, "Expense created successfully!"));
});

const handleEditExpense = asyncHandler(async (req, res) => {
  const { name, amount, type, category, date, note } = req.body;

  const { expenseId } = req.params;

  const { userId } = req.user;

  const expense = await Expense.findOne({
    _id: expenseId,
    user: userId,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (!mongoose.Types.ObjectId.isValid(expenseId))
    throw new ApiError(400, "Invalid expense ID");

  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Name cannot be empty");
    }
    updates.name = name;
  }

  if (amount !== undefined) {
    if (amount <= 0) {
      throw new ApiError(400, "Amount must be greater than 0");
    }
    updates.amount = amount;
  }

  if (category !== undefined) {
    updates.category = category;
  }

  if (type !== undefined) {
    if (type !== "credit" && type !== "debit") {
      throw new ApiError(400, "Enter a valid transaction type");
    }
    updates.transactionType = type;
  }

  if (date !== undefined) {
    if (isNaN(new Date(date).getTime())) {
      throw new ApiError(400, "Invalid date");
    }
    updates.date = date;
  }

  if (note !== undefined) {
    if (!note.trim()) {
      throw new ApiError(400, "Note cannot be empty");
    }

    updates.note = note;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: expenseId, user: userId },
    { $set: updates },
    { new: true },
  );

  if (!expense) throw new ApiError(404, "Error updating expense");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedExpense, "Expense updated successfully!"),
    );
});

const handleDeleteExpense = asyncHandler(async (req, res) => {
  const expenseId = req.params.expenseId;
});

export { handleCreateExpense, handleEditExpense };
