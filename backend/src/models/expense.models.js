import { Schema, model } from "mongoose";

const expenseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim:true,
    },
    amount: {
      type: Number,
      required: true,
      min : 0,
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
      default: Date.now,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Expense = model("expense", expenseSchema);
