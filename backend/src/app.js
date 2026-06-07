import express from "express";
import userRouter from "./routes/user.routes.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/user", userRouter);

export { app };
