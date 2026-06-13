import { Expense } from "../models/expense.models.js";
import { User } from "../models/user.models.js";
import { Category } from "../models/category.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import mongoose, { mongo } from "mongoose";

// create expense
const handleCreateExpense = asyncHandler(async (req, res) => {
  const { name, amount, type, category, date, note } = req.body;

  if (!name || amount === undefined || !type || !date) {
    throw new ApiError(400, "All fields are required");
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new ApiError(400, "Amount must be a number greater than 0");
  }

  const user = await User.findById(req.user.userId);

  let categoryId;
  if (category && category.trim()) {
    if (category.trim().toLowerCase()) {
      const searchCategory = await Category.findOne({
        name: category.trim().toLowerCase(),
      });

      if (searchCategory) {
        categoryId = searchCategory._id;
      } else {
        throw new ApiError(404, "Category not found");
      }
    }
  }

  const expense = await Expense.create({
    name: name,
    amount: parsedAmount,
    transactionType: type,
    category: categoryId,
    date: date || Date.now(),
    note: note,
    user: user,
  });

  if (!expense) throw new ApiError(500, "Error creating expense");

  return res
    .status(201)
    .json(new ApiResponse(201, { expense }, "Expense created successfully!"));
});

const handleEditExpense = asyncHandler(async (req, res) => {
  const { name, amount, type, category, date, note } = req.body;

  const { expenseId } = req.params;

  const { userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(expenseId))
    throw new ApiError(400, "Invalid expense ID");

  const expense = await Expense.findOne({
    _id: expenseId,
    user: userId,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Name cannot be empty");
    }
    updates.name = name;
  }

  if (amount !== undefined) {
    const parsedUpdAmount = Number(amount);
    if (isNaN(parsedUpdAmount) || parsedUpdAmount <= 0) {
      throw new ApiError(400, "Amount must be a number greater than 0");
    }
    updates.amount = parsedUpdAmount;
  }
  let categoryId;
  if (category && category.trim()) {
    if (category.trim().toLowerCase()) {
      const searchCategory = await Category.findOne({
        name: category.trim().toLowerCase(),
      });

      if (searchCategory) {
        categoryId = searchCategory._id;
      } else {
        throw new ApiError(404, "Category not found");
      }
    }
  }

  if (category !== undefined) {
    updates.category = categoryId;
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

  if (!updatedExpense) throw new ApiError(404, "Error updating expense");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedExpense, "Expense updated successfully!"),
    );
});

const handleDeleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const { userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(expenseId))
    throw new ApiError(400, "Invalid expense id");

  const expense = await Expense.findOneAndDelete({
    _id: expenseId,
    user: userId,
  });

  if (!expense) throw new ApiError(404, "Expense not found!");

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense deleted successfully"));
});

const handleGetExpenses = asyncHandler(async (req, res) => {
  const {
    period,
    targetDate,
    from,
    to,
    type,
    categoryId,
    search,
    minAmount,
    maxAmount,
    sort,
    page,
    limit,
  } = req.query;

  const filterObject = {};
  const mongoQuery = {
    user: req.user.userId,
  };

  const allowedPeriods = ["day", "week", "month", "year"];

  if (period !== undefined && (from !== undefined || to !== undefined)) {
    throw new ApiError(400, "Period cannot be used with from/to date filters");
  }

  if (period !== undefined) {
    if (targetDate === undefined) {
      throw new ApiError(400, "targetDate is required when period is provided");
    }

    let isValidTargetDate = false;

    if (period === "day") {
      isValidTargetDate = /^\d{4}-\d{2}-\d{2}$/.test(targetDate);
    }

    if (period === "month") {
      isValidTargetDate = /^\d{4}-\d{2}$/.test(targetDate);
    }

    if (period === "year") {
      isValidTargetDate = /^\d{4}$/.test(targetDate);
    }

    if (!isValidTargetDate) {
      throw new ApiError(400, "Invalid targetDate for selected period");
    }
    filterObject.period = period;
    filterObject.targetDate = targetDate;
  }

  if (from !== undefined) {
    const fromDate = new Date(from);

    if (isNaN(fromDate.getTime())) {
      throw new ApiError(400, "Invalid from date");
    }

    filterObject.from = fromDate;
  }

  if (to !== undefined) {
    const toDate = new Date(to);

    if (isNaN(toDate.getTime())) {
      throw new ApiError(400, "Invalid to date");
    }

    filterObject.to = toDate;
  }

  // date range validation
  if (
    filterObject.from &&
    filterObject.to &&
    filterObject.from > filterObject.to
  ) {
    throw new ApiError(400, "'from' date cannot be later than 'to' date");
  }

  const allowedTypes = ["credit", "debit"];

  if (type !== undefined) {
    if (!allowedTypes.includes(type)) {
      throw new ApiError(400, "Invalid type");
    }

    filterObject.type = type;
  }

  // category validation
  if (categoryId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new ApiError(400, "Invalid category id");
    }

    const categoryExists = await Category.exists({
      _id: categoryId,
    });

    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }

    filterObject.categoryId = categoryId;
  }

  // search validation
  if (search !== undefined) {
    const trimmedSearch = search.trim();

    if (trimmedSearch.length === 0) {
      throw new ApiError(400, "Search query cannot be empty");
    }

    filterObject.search = trimmedSearch;
  }

  // minAmount maxAmount validation
  if (minAmount !== undefined) {
    if (minAmount.trim() === "") {
      throw new ApiError(400, "minAmount cannot be empty");
    }

    const min = Number(minAmount);

    if (!/^\d+(\.\d+)?$/.test(min)) {
      throw new ApiError(400, "Invalid minAmount");
    }

    if (min < 0) {
      throw new ApiError(400, "minAmount cannot be negative");
    }

    filterObject.minAmount = min;
  }

  if (maxAmount !== undefined) {
    if (maxAmount.trim() === "") {
      throw new ApiError(400, "maxAmount cannot be empty");
    }

    const max = Number(maxAmount);

    if (!/^\d+(\.\d+)?$/.test(max)) {
      throw new ApiError(400, "Invalid maxAmount");
    }

    if (max < 0) {
      throw new ApiError(400, "maxAmount cannot be negative");
    }

    filterObject.maxAmount = max;
  }

  if (
    filterObject.minAmount !== undefined &&
    filterObject.maxAmount !== undefined &&
    filterObject.minAmount > filterObject.maxAmount
  ) {
    throw new ApiError(400, "minAmount cannot be greater than maxAmount");
  }

  // sort validation
  const allowedSorts = ["date_desc", "date_asc", "amount_desc", "amount_asc"];

  if (sort !== undefined) {
    if (!allowedSorts.includes(sort)) {
      throw new ApiError(400, "Invalid sort option");
    }

    filterObject.sort = sort;
  } else {
    filterObject.sort = "date_desc";
  }

  // page validation
  if (page !== undefined) {
    const trimmedPage = page.trim();

    if (trimmedPage === "") {
      throw new ApiError(400, "Page cannot be empty");
    }

    if (!/^\d+$/.test(trimmedPage)) {
      throw new ApiError(400, "Invalid page");
    }

    const pageNumber = Number(trimmedPage);

    if (pageNumber < 1) {
      throw new ApiError(400, "Page must be greater than 0");
    }

    filterObject.page = pageNumber;
  } else {
    filterObject.page = 1;
  }

  // limit validation
  if (limit !== undefined) {
    const trimmedLimit = limit.trim();

    if (trimmedLimit.length === 0) {
      throw new ApiError(400, "Limit cannot be empty");
    }

    if (!/^\d+$/.test(trimmedLimit)) {
      throw new ApiError(400, "Invalid limit");
    }

    const limitNumber = Number(trimmedLimit);

    if (trimmedLimit.length === 0) {
      throw new ApiError(400, "Limit cannot be empty");
    }

    if (!/^\d+$/.test(trimmedLimit)) {
      throw new ApiError(400, "Invalid limit");
    }

    filterObject.limit = limitNumber;
  } else {
    filterObject.limit = 20;
  }

  if (filterObject.type) {
    mongoQuery.transactionType = filterObject.type;
  }

  if (filterObject.categoryId) {
    mongoQuery.category = filterObject.categoryId;
  }

  if (
    filterObject.minAmount !== undefined ||
    filterObject.maxAmount !== undefined
  ) {
    mongoQuery.amount = {};

    if (filterObject.minAmount !== undefined) {
      mongoQuery.amount.$gte = filterObject.minAmount;
    }

    if (filterObject.maxAmount !== undefined) {
      mongoQuery.amount.$lte = filterObject.maxAmount;
    }
  }

  if (filterObject.search) {
    mongoQuery.$or = [
      {
        name: {
          $regex: filterObject.search,
          $options: "i",
        },
      },
      {
        note: {
          $regex: filterObject.search,
          $options: "i",
        },
      },
    ];
  }

  if (filterObject.from || filterObject.to) {
    mongoQuery.date = {};

    if (filterObject.from) {
      mongoQuery.date.$gte = filterObject.from;
    }

    if (filterObject.to) {
      mongoQuery.date.$lte = filterObject.to;
    }
  }

  if (filterObject.period === "day") {
    const start = new Date(filterObject.targetDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    mongoQuery.date = {
      $gte: start,
      $lt: end,
    };
  }

  if (filterObject.period === "month") {
    const [year, month] = filterObject.targetDate.split("-");

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    mongoQuery.date = {
      $gte: start,
      $lt: end,
    };
  }

  if (filterObject.period === "year") {
    const year = Number(filterObject.targetDate);

    const start = new Date(year, 0, 1);

    const end = new Date(year + 1, 0, 1);

    mongoQuery.date = {
      $gte: start,
      $lt: end,
    };
  }

  // sorting

  const sortMap = {
    date_desc: { date: -1 },
    date_asc: { date: 1 },
    amount_desc: { amount: -1 },
    amount_asc: { amount: 1 },
  };

  const mongoSort = sortMap[filterObject.sort];

  // pagination

  const skip = (filterObject.page - 1) * filterObject.limit;

  const expenses = await Expense.find(mongoQuery)
    .populate("category", "name -_id")
    .sort(mongoSort)
    .skip(skip)
    .limit(filterObject.limit);

  if (!expenses) {
    throw new ApiError(404, "Expenses not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully!"));
});

const handleGetExpenseSummary = asyncHandler(async (req, res) => {
  const {
    period,
    targetDate,
    from,
    to,
    type,
    categoryId,
    search,
    minAmount,
    maxAmount,
    sort,
    page,
    limit,
  } = req.query;

  const filterObject = {};
  const mongoQuery = {
    user: req.user.userId,
  };

  const allowedPeriods = ["day", "week", "month", "year"];

  if (period !== undefined && (from !== undefined || to !== undefined)) {
    throw new ApiError(400, "Period cannot be used with from/to date filters");
  }

  if (period !== undefined) {
    if (targetDate === undefined) {
      throw new ApiError(400, "targetDate is required when period is provided");
    }

    let isValidTargetDate = false;

    if (period === "day") {
      isValidTargetDate = /^\d{4}-\d{2}-\d{2}$/.test(targetDate);
    }

    if (period === "month") {
      isValidTargetDate = /^\d{4}-\d{2}$/.test(targetDate);
    }

    if (period === "year") {
      isValidTargetDate = /^\d{4}$/.test(targetDate);
    }

    if (!isValidTargetDate) {
      throw new ApiError(400, "Invalid targetDate for selected period");
    }
    filterObject.period = period;
    filterObject.targetDate = targetDate;
  }

  if (from !== undefined) {
    const fromDate = new Date(from);

    if (isNaN(fromDate.getTime())) {
      throw new ApiError(400, "Invalid from date");
    }

    filterObject.from = fromDate;
  }

  if (to !== undefined) {
    const toDate = new Date(to);

    if (isNaN(toDate.getTime())) {
      throw new ApiError(400, "Invalid to date");
    }

    filterObject.to = toDate;
  }

  // date range validation
  if (
    filterObject.from &&
    filterObject.to &&
    filterObject.from > filterObject.to
  ) {
    throw new ApiError(400, "'from' date cannot be later than 'to' date");
  }

  const allowedTypes = ["credit", "debit"];

  if (type !== undefined) {
    if (!allowedTypes.includes(type)) {
      throw new ApiError(400, "Invalid type");
    }

    filterObject.type = type;
  }

  // category validation
  if (categoryId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new ApiError(400, "Invalid category id");
    }

    const categoryExists = await Category.exists({
      _id: categoryId,
    });

    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }

    filterObject.categoryId = categoryId;
  }

  // search validation
  if (search !== undefined) {
    const trimmedSearch = search.trim();

    if (trimmedSearch.length === 0) {
      throw new ApiError(400, "Search query cannot be empty");
    }

    filterObject.search = trimmedSearch;
  }

  // minAmount maxAmount validation
  if (minAmount !== undefined) {
    if (minAmount.trim() === "") {
      throw new ApiError(400, "minAmount cannot be empty");
    }

    const min = Number(minAmount);

    if (!/^\d+(\.\d+)?$/.test(min)) {
      throw new ApiError(400, "Invalid minAmount");
    }

    if (min < 0) {
      throw new ApiError(400, "minAmount cannot be negative");
    }

    filterObject.minAmount = min;
  }

  if (maxAmount !== undefined) {
    if (maxAmount.trim() === "") {
      throw new ApiError(400, "maxAmount cannot be empty");
    }

    const max = Number(maxAmount);

    if (!/^\d+(\.\d+)?$/.test(max)) {
      throw new ApiError(400, "Invalid maxAmount");
    }

    if (max < 0) {
      throw new ApiError(400, "maxAmount cannot be negative");
    }

    filterObject.maxAmount = max;
  }

  if (
    filterObject.minAmount !== undefined &&
    filterObject.maxAmount !== undefined &&
    filterObject.minAmount > filterObject.maxAmount
  ) {
    throw new ApiError(400, "minAmount cannot be greater than maxAmount");
  }

  // sort validation
  const allowedSorts = ["date_desc", "date_asc", "amount_desc", "amount_asc"];

  if (sort !== undefined) {
    if (!allowedSorts.includes(sort)) {
      throw new ApiError(400, "Invalid sort option");
    }

    filterObject.sort = sort;
  } else {
    filterObject.sort = "date_desc";
  }

  // page validation
  if (page !== undefined) {
    const trimmedPage = page.trim();

    if (trimmedPage === "") {
      throw new ApiError(400, "Page cannot be empty");
    }

    if (!/^\d+$/.test(trimmedPage)) {
      throw new ApiError(400, "Invalid page");
    }

    const pageNumber = Number(trimmedPage);

    if (pageNumber < 1) {
      throw new ApiError(400, "Page must be greater than 0");
    }

    filterObject.page = pageNumber;
  } else {
    filterObject.page = 1;
  }

  // limit validation
  if (limit !== undefined) {
    const trimmedLimit = limit.trim();

    if (trimmedLimit.length === 0) {
      throw new ApiError(400, "Limit cannot be empty");
    }

    if (!/^\d+$/.test(trimmedLimit)) {
      throw new ApiError(400, "Invalid limit");
    }

    const limitNumber = Number(trimmedLimit);

    if (trimmedLimit.length === 0) {
      throw new ApiError(400, "Limit cannot be empty");
    }

    if (!/^\d+$/.test(trimmedLimit)) {
      throw new ApiError(400, "Invalid limit");
    }

    filterObject.limit = limitNumber;
  } else {
    filterObject.limit = 20;
  }

  if (filterObject.type) {
    mongoQuery.transactionType = filterObject.type;
  }

  if (filterObject.categoryId) {
    mongoQuery.category = filterObject.categoryId;
  }

  if (
    filterObject.minAmount !== undefined ||
    filterObject.maxAmount !== undefined
  ) {
    mongoQuery.amount = {};

    if (filterObject.minAmount !== undefined) {
      mongoQuery.amount.$gte = filterObject.minAmount;
    }

    if (filterObject.maxAmount !== undefined) {
      mongoQuery.amount.$lte = filterObject.maxAmount;
    }
  }

  if (filterObject.search) {
    mongoQuery.$or = [
      {
        name: {
          $regex: filterObject.search,
          $options: "i",
        },
      },
      {
        note: {
          $regex: filterObject.search,
          $options: "i",
        },
      },
    ];
  }

  if (filterObject.from || filterObject.to) {
    mongoQuery.date = {};

    if (filterObject.from) {
      mongoQuery.date.$gte = filterObject.from;
    }

    if (filterObject.to) {
      mongoQuery.date.$lte = filterObject.to;
    }
  }

  if (filterObject.period === "day") {
    const start = new Date(filterObject.targetDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    mongoQuery.date = {
      $gte: start,
      $lt: end,
    };
  }

  if (filterObject.period === "month") {
    const [year, month] = filterObject.targetDate.split("-");

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    mongoQuery.date = {
      $gte: start,
      $lt: end,
    };
  }

  if (filterObject.period === "year") {
    const year = Number(filterObject.targetDate);

    const start = new Date(year, 0, 1);

    const end = new Date(year + 1, 0, 1);

    mongoQuery.date = {
      $gte: start,
      $lt: end,
    };
  }

  mongoQuery.user = new mongoose.Types.ObjectId(mongoQuery.user);

  const expensesSummary = await Expense.aggregate([
    { $match: mongoQuery },
    {
      $group: {
        _id: null,
        transactionsCount: { $sum: 1 },
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
      },
    },
    {
      $project: {
        transactionsCount: 1,
        debitSum: 1,
        creditSum: 1,
        debitCount: 1,
        creditCount: 1,
        _id: 0,
      },
    },
  ]);

  let resultObj = {};

  if (expensesSummary.length !== 0) {
    resultObj = {
      ...expensesSummary[0],
      balance: expensesSummary[0].creditSum - expensesSummary[0].debitSum,
    };
  }

  if (expensesSummary.length == 0) {
    resultObj.transactionsCount = 0;
    resultObj.debitCount = 0;
    resultObj.creditCount = 0;
    resultObj.debitSum = 0;
    resultObj.creditSum = 0;
    resultObj.balance = 0;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, resultObj, "Expenses summary fetched successfully!"),
    );
});

const handleGetCategoryBreakdown = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;

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
  handleCreateExpense,
  handleEditExpense,
  handleDeleteExpense,
  handleGetCategoryBreakdown,
  handleGetExpenseSummary,
  handleGetExpenses,
};
