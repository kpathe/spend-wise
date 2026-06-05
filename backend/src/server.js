import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT;
const mongodbURI = process.env.MONGODBURI;

connectDB(mongodbURI)
  .then(() => {
    app.listen(PORT, (error) => {
      if (!error) {
        console.log(`Server is listening at PORT: ${PORT}`);
      } else {
        console.log("Error occured,server can't start", error);
      }
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed!", err);
  });
