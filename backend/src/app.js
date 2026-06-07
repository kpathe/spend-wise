import express from "express";
import userRouter from "./routes/user.routes.js";
const app = express();


app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/user", userRouter);

export { app };
