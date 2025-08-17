import {
  getUsers,
  registerUsers,
  verifyEmail,
} from "../controller/userController.js";
import express from "express";
import uploads from "../middleware/uploads.js";
const userRouter = express.Router();

userRouter.get("/getUsers", getUsers);
userRouter.post("/registerUsers", uploads.single("image"), registerUsers);
userRouter.post("/verifyEmail", verifyEmail);

export { userRouter };
