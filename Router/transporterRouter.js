
import express from "express";
import uploads from "../middlewares/uploads.js";
import { getTransporter, registerTransporter, verifyEmail } from "../controller/transporterController.js";
const transporterRouter = express.Router();

transporterRouter.get("/getTransporter", getTransporter);
transporterRouter.post("/registerTransporters", uploads.single("image"), registerTransporter);
transporterRouter.post("/verifyEmail", verifyEmail);

export { transporterRouter };
