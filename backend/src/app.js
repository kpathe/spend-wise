import express from "express";
import userRouter from "./routes/user.routes.js";
import expenseRouter from "./routes/expense.routes.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: [
      "https://spendwise-bay-nine.vercel.app",
      "https://spendwise-expense.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/categories", categoryRouter);

app.use(errorHandler);

export { app };
