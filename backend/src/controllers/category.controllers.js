import { Category } from "../models/category.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

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

const handleGetCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  if (!categories) throw new ApiError(404, "Categories not found!");

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully!"));
});

const handleGetCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(categoryId))
    throw new ApiError(400, "Invalid categoryId");

  const category = await Category.findOne({ _id: categoryId });

  if (!category) throw new ApiError(404, "Category not found!");

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category fetched successfully"));
});

export { handleCreateCategory, handleGetCategories, handleGetCategory };
