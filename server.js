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
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
// parse cookies
app.use(cookieParser());
const allowedOrigins = [
  "https://cargo-merge.vercel.app/", // Deployed React frontend
  "http://localhost:5173", // Local React dev
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl/postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS: ", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// These parsers are fine for normal requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// But multer will handle `multipart/form-data` requests in routes
app.use("/", userRouter);

app.listen(port, () => {
  console.log(`Connected successfully at ${port}`);
});
