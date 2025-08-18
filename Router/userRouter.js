import {
  getUsers,
  loginuser,
  registerUsers,
  verifyEmail,
} from "../controller/userController.js";
import express from "express";
import uploads from "../middlewares/uploads.js";
const userRouter = express.Router();

userRouter.get("/getUsers", getUsers);
userRouter.post("/registerUsers", uploads.single("image"), registerUsers);
userRouter.post("/verifyEmail", verifyEmail);
userRouter.post("/login", loginuser);

export { userRouter };
