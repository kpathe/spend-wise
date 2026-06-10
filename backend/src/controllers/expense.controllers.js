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

export { handleCreateExpense };
