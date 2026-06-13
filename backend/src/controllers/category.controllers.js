import { Category } from "../models/category.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const handleCreateCategory = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) throw new ApiError(400, "All fields are required");

  const existingCategory = await Category.findOne({
    name: name.trim().toLowerCase(),
  });

  if (existingCategory) throw new ApiError(400, "Category already exists!");

  if (
    type.trim().toLowerCase() !== "credit" &&
    type.trim().toLowerCase() !== "debit"
  )
    throw new ApiError(400, "Invalid transaction type");

  const category = await Category.create({
    name: name.trim().toLowerCase(),
    transactionType: type.trim().toLowerCase(),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category created successfully!"));
});

export { handleCreateCategory };
