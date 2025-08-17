// import pool from "./db.js";
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { userRouter } from "./Router/userRouter.js";

// const app = express();
// const port = process.env.PORT || 5000;
// app.use(express.json()); // <-- Parses JSON bodies
// app.use(express.urlencoded({ extended: true })); 

// app.use("/", userRouter)

// app.listen(port, () => {
//   console.log(`Connected sussesfully at ${port}`);
// });
// server.js
import pool from "./db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./Router/userRouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// These parsers are fine for normal requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// But multer will handle `multipart/form-data` requests in routes
app.use("/", userRouter);

app.listen(port, () => {
  console.log(`Connected successfully at ${port}`);
});
