import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    transactionType: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
  },
  { timestamps: true },
);


export const Category = model("Category", categorySchema);
