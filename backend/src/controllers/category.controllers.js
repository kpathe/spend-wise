import { Category } from "../models/category.models.js";
import { Expense } from "../models/expense.models.js";
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

const handleGetCategoryBreakdown = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const matchStage = {
    user: new mongoose.Types.ObjectId(req.user.userId),
  };

  if (mongoose.Types.ObjectId.isValid(categoryId)) {
    matchStage.category = new mongoose.Types.ObjectId(categoryId);
  } else {
    throw new ApiError(400, "Invalid categoryId");
  }

  const breakdown = await Expense.aggregate([
    {
      $match: matchStage,
    },

    {
      $group: {
        _id: "$category",

        expensesCount: {
          $sum: 1,
        },

        debitCount: {
          $sum: {
            $cond: [
              {
                $eq: ["$transactionType", "debit"],
              },
              1,
              0,
            ],
          },
        },

        creditCount: {
          $sum: {
            $cond: [
              {
                $eq: ["$transactionType", "credit"],
              },
              1,
              0,
            ],
          },
        },

        debitSum: {
          $sum: {
            $cond: [
              {
                $eq: ["$transactionType", "debit"],
              },
              "$amount",
              0,
            ],
          },
        },

        creditSum: {
          $sum: {
            $cond: [
              {
                $eq: ["$transactionType", "credit"],
              },
              "$amount",
              0,
            ],
          },
        },
      },
    },

    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },

    {
      $unwind: "$category",
    },

    {
      $project: {
        _id: 0,

        categoryId: "$category._id",
        categoryName: "$category.name",

        expensesCount: 1,
        debitCount: 1,
        creditCount: 1,

        debitSum: 1,
        creditSum: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        breakdown[0],
        "Category breakdown fetched successfully",
      ),
    );
});
export {
  handleCreateCategory,
  handleGetCategories,
  handleGetCategory,
  handleGetCategoryBreakdown,
};
