import { Schema, model } from "mongoose";

const expenseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    date: {
      type: Date,
      required: true,
    },
    note: {
      types: String,
      required: false,
    },
  },
  { timestamps: true },
);

export const Expense = model("expense", expenseSchema);
