import express from "express";
import userRouter from "./routes/user.routes.js";
import expenseRouter from "./routes/expense.routes.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/categories", categoryRouter);


export { app };
