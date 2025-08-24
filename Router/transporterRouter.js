
import express from "express";
import uploads from "../middlewares/uploads.js";
import { getTransporter, registerTransporter, verifyEmail } from "../controller/transporterController.js";
const transporterRouter = express.Router();

userRouter.get("/getTransporter", getTransporter);
userRouter.post("/registerTransporters", uploads.single("image"), registerTransporter);
userRouter.post("/verifyEmail", verifyEmail);
userRouter.post("/login", loginuser);

export { transporterRouter };
