import pool from "../db.js";
import {
  getUsers,
  loginuser,
  registerUsers,
  verifyEmail,
} from "../controller/userController.js";
import express from "express";
import uploads from "../middlewares/uploads.js";
import { verifyToken } from "../config/verifyToken.js";
const userRouter = express.Router();

userRouter.get("/api/protectedRouteToken", verifyToken, async (req, res) => {
  try {
    // Fetch user from the database using Prisma
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    // const user = await prisma.user.findUnique({
    //   where: { id: req.user.id }, // User ID from decoded token
    // });

    if (user.rowCount < 1) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Token retrived successfully.",
      userInfoII: req.user, // Includes subscription details
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

userRouter.get("/getUsers", getUsers);
userRouter.post("/registerUsers", uploads.single("image"), registerUsers);
userRouter.post("/verifyEmail", verifyEmail);
userRouter.post("/login", loginuser);

export { userRouter };
