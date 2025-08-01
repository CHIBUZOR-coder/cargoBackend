import { getUsers } from "../controller/userController.js";
import express from "express";
const userRouter = express.Router();
userRouter.get("/getUsers", getUsers);

export  {userRouter};
