import pool from "../db.js"; // ✅ Triggers pool setup
import dotenv from "dotenv";
import bcrypt, { compare } from "bcrypt";
dotenv.config();

export const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (error) {
    console.error("DB error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const registerUsers = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    address,
    password,
    confirmpassword,
    role,
  } = req.body;
  try {
    if (!firstname) {
      return res
        .status(400)
        .json({ success: false, message: " Firstname is missing" });
    }
    if (!lastname) {
      return res
        .status(400)
        .json({ success: false, message: " Lasttname is missing" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: " Email is missing" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: " Phone is missing" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: " Email is missing" });
    }
    if (!address) {
      return res
        .status(400)
        .json({ success: false, message: "Adress is missing" });
    }
    //validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    //validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (password !== confirmpassword)
      return res
        .status(400)
        .json({ success: false, message: "Password does not match" });

    //crate a bycrypt salt
    const salt = await bcrypt.genSalt(10);

    // hash the password with the salt using bcrypt
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount > 0)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const newUser = await pool.query(
      "INSERT INTO users (firstname, lastname, email, phone, adress, password, confirmpassword) VALUES($1, $2, $3, $4, $5, $6, $7) Returning * ",
      [
        firstname,
        lastname,
        email,
        phone,
        address,
        hashedPassword,
        confirmpassword,
      ]
    );
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
