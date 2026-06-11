import { Expense } from "../models/expense.models.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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

  if (!name && !amount)
    throw new ApiError(400, "Atleast one field is required");

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
    if (type !== "credit" || type !== "debit") {
      throw new ApiError(400, "Enter a valid transaction type");
    }
    updates.transactionType = type;
  }

  if (date !== undefined) {
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

  const expense = await Expense.findByIdAndUpdate(
    req.params.expenseId,
    { $set: updates },
    { new: true },
  );

  if (!expense) throw new ApiError(204, "Error updating expense");

  console.log(expense);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense updated successfully!"));
});

export { handleCreateExpense, handleEditExpense };
