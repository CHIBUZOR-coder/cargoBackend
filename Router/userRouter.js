import { getUsers, registerUsers } from "../controller/userController.js";
import express from "express";
const userRouter = express.Router();



userRouter.get("/getUsers", getUsers);
userRouter.post("/registerUsers", registerUsers);

export  {userRouter};
