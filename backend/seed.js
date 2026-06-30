import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/user.models.js";
import { Category } from "./src/models/category.models.js";
import { Expense } from "./src/models/expense.models.js";
import { connectDB } from "./src/db/index.js";

dotenv.config();

const standardCategories = [
  // Debit Categories
  { name: "food", transactionType: "debit" },
  { name: "travel", transactionType: "debit" },
  { name: "shopping", transactionType: "debit" },
  { name: "bills", transactionType: "debit" },
  { name: "rent", transactionType: "debit" },
  { name: "healthcare", transactionType: "debit" },
  { name: "education", transactionType: "debit" },
  { name: "entertainment", transactionType: "debit" },
  { name: "fuel", transactionType: "debit" },
  { name: "investment", transactionType: "debit" },

  // Credit Categories
  { name: "salary", transactionType: "credit" },
  { name: "freelance", transactionType: "credit" },
  { name: "business", transactionType: "credit" },
  { name: "interest", transactionType: "credit" },
  { name: "dividend", transactionType: "credit" },
  { name: "gift", transactionType: "credit" },
  { name: "refund", transactionType: "credit" },
  { name: "other income", transactionType: "credit" },
];

const mongodbURI = process.env.MONGODBURI;

const seedDummyData = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB(mongodbURI);
    console.log("Connected to MongoDB.");

    // 1. Seed / Ensure categories exist
    console.log("Seeding categories...");
    const categoryOps = standardCategories.map((cat) => ({
      updateOne: {
        filter: { name: cat.name.toLowerCase() },
        update: { $setOnInsert: cat },
        upsert: true,
      },
    }));
    await Category.bulkWrite(categoryOps);
    console.log("Categories ensured in DB.");

    // Fetch all categories to map by name
    const dbCategories = await Category.find({});
    const categoryMap = {};
    dbCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
    });

    // 2. Seed / Ensure Dummy User exists
    console.log("Ensuring dummy user exists...");
    const dummyUserEmail = "dummy@spendwise.com";
    let dummyUser = await User.findOne({ email: dummyUserEmail });

    if (!dummyUser) {
      dummyUser = await User.create({
        name: "Dummy User",
        username: "dummyuser",
        email: dummyUserEmail,
        password: "password123", // Will be automatically encrypted by mongoose pre-save hook
      });
      console.log("Dummy user created with login: dummy@spendwise.com / password123");
    } else {
      console.log("Dummy user already exists.");
    }

    // 3. Clear existing expenses for the dummy user to allow clean seed re-runs
    console.log("Clearing old expenses for dummy user...");
    await Expense.deleteMany({ user: dummyUser._id });

    // 4. Create dummy expenses aligned dynamically to the current system time
    console.log("Creating dummy expenses...");
    
    const getPastDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    };

    const dummyExpenses = [
      // TODAY'S EXPENSES (Debit)
      {
        name: "Starbucks Coffee",
        amount: 350,
        transactionType: "debit",
        category: categoryMap["food"],
        date: getPastDate(0),
        note: "Morning vanilla latte with sandwich",
      },
      {
        name: "Uber Ride",
        amount: 180,
        transactionType: "debit",
        category: categoryMap["travel"],
        date: getPastDate(0),
        note: "Commute to office",
      },
      // YESTERDAY
      {
        name: "Zara Jacket",
        amount: 2499,
        transactionType: "debit",
        category: categoryMap["shopping"],
        date: getPastDate(1),
        note: "Winter sale discount buy",
      },
      // 3 DAYS AGO
      {
        name: "Electricity Bill",
        amount: 1200,
        transactionType: "debit",
        category: categoryMap["bills"],
        date: getPastDate(3),
        note: "May summer season utility bill",
      },
      // 10 DAYS AGO
      {
        name: "Apartment Rent",
        amount: 12000,
        transactionType: "debit",
        category: categoryMap["rent"],
        date: getPastDate(10),
        note: "June month house rent payout",
      },
      // 15 DAYS AGO
      {
        name: "Netflix Premium",
        amount: 649,
        transactionType: "debit",
        category: categoryMap["entertainment"],
        date: getPastDate(15),
        note: "Monthly subscription renewal",
      },
      // 20 DAYS AGO
      {
        name: "Petrol Station",
        amount: 1500,
        transactionType: "debit",
        category: categoryMap["fuel"],
        date: getPastDate(20),
        note: "Full tank fuel refill",
      },
      // 25 DAYS AGO
      {
        name: "Mutual Fund SIP",
        amount: 5000,
        transactionType: "debit",
        category: categoryMap["investment"],
        date: getPastDate(25),
        note: "Nifty 50 Index Fund investment",
      },
      // 35 DAYS AGO
      {
        name: "Dental Checkup",
        amount: 800,
        transactionType: "debit",
        category: categoryMap["healthcare"],
        date: getPastDate(35),
        note: "Dentist scaling consultation",
      },
      // 45 DAYS AGO
      {
        name: "Vite Course",
        amount: 499,
        transactionType: "debit",
        category: categoryMap["education"],
        date: getPastDate(45),
        note: "Udemy frontend master course",
      },

      // CREDITS (Income)
      // 2 DAYS AGO (Active month)
      {
        name: "Tech Corp Salary",
        amount: 45000,
        transactionType: "credit",
        category: categoryMap["salary"],
        date: getPastDate(2),
        note: "Monthly software job salary credit",
      },
      // 12 DAYS AGO
      {
        name: "Website Design Project",
        amount: 15000,
        transactionType: "credit",
        category: categoryMap["freelance"],
        date: getPastDate(12),
        note: "Freelance client landing page work",
      },
      // 22 DAYS AGO
      {
        name: "TCS Stock Dividend",
        amount: 1200,
        transactionType: "credit",
        category: categoryMap["dividend"],
        date: getPastDate(22),
        note: "Quarterly stock dividend credit",
      },
      // 28 DAYS AGO
      {
        name: "Birthday Gift",
        amount: 5000,
        transactionType: "credit",
        category: categoryMap["gift"],
        date: getPastDate(28),
        note: "Birthday gift from parents",
      },
      // 40 DAYS AGO
      {
        name: "Amazon Return Refund",
        amount: 950,
        transactionType: "credit",
        category: categoryMap["refund"],
        date: getPastDate(40),
        note: "Refund of returned shirt package",
      },
    ];

    // Inject user ID to each expense
    const expensesWithUser = dummyExpenses.map((exp) => ({
      ...exp,
      user: dummyUser._id,
    }));

    await Expense.insertMany(expensesWithUser);
    console.log("Dummy expenses successfully seeded!");
    
    console.log("\n==================================================");
    console.log("SEED COMPLETED.");
    console.log("Use the following credentials to login and test:");
    console.log(`Email:    ${dummyUserEmail}`);
    console.log("Password: password123");
    console.log("==================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding dummy data:", error);
    process.exit(1);
  }
};

seedDummyData();
