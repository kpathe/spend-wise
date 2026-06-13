import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "./src/models/category.models.js";
import { connectDB } from "./src/db/index.js";

dotenv.config();

const categories = [
  // Debit Categories
  { name: "Food", transactionType: "debit" },
  { name: "Travel", transactionType: "debit" },
  { name: "Shopping", transactionType: "debit" },
  { name: "Bills", transactionType: "debit" },
  { name: "Rent", transactionType: "debit" },
  { name: "Healthcare", transactionType: "debit" },
  { name: "Education", transactionType: "debit" },
  { name: "Entertainment", transactionType: "debit" },
  { name: "Fuel", transactionType: "debit" },
  { name: "Investment", transactionType: "debit" },

  // Credit Categories
  { name: "Salary", transactionType: "credit" },
  { name: "Freelance", transactionType: "credit" },
  { name: "Business", transactionType: "credit" },
  { name: "Interest", transactionType: "credit" },
  { name: "Dividend", transactionType: "credit" },
  { name: "Gift", transactionType: "credit" },
  { name: "Refund", transactionType: "credit" },
  { name: "Other Income", transactionType: "credit" },
];
const mongodbURI = process.env.MONGODBURI;
const seedCategories = async () => {
  try {
    await connectDB(mongodbURI);

    const operations = categories.map((category) => ({
      updateOne: {
        filter: {
          name: category.name.toLowerCase(),
        },
        update: {
          $setOnInsert: {
            ...category,
          },
        },
        upsert: true,
      },
    }));

    await Category.bulkWrite(operations);

    console.log("Categories seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
