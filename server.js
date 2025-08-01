import pool from "./db.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./Router/userRouter.js";

const app = express();
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Connected sussesfully at ${port}`);
});
