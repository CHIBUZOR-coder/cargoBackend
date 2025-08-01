import pool from "../db.js"; // ✅ Triggers pool setup
import dotenv from "dotenv";
import bcrypt, { compare } from "bcrypt";
import { cloudinary } from "../config/cloudinary.js";
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

  console.log("reqbody:", req.body);

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
    if (!confirmpassword) {
      return res
        .status(400)
        .json({ success: false, message: "Confirmpassword is missing" });
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

    let imageUrl;
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    if (req.file) {
      console.log("Starting image upload...");
      // console.log("File buffer:", req.file.buffer);
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid image format" });
      }
      try {
        // Use async/await to handle the image upload process
        imageUrl = await uploadImageToCloudinary(req.file.buffer);

        // After the upload completes, log the image URL
        console.log("Image URL after upload:", imageUrl);
      } catch (error) {
        console.error("Error during upload:", error);
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }
    }

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
      "INSERT INTO users (firstname, lastname, email, phone, address, password, confirmpassword) VALUES($1, $2, $3, $4, $5, $6, $7) Returning * ",
      [firstname, lastname, email, phone, address, hashedPassword, null]
    );

    if (newUser.rowCount > 0) {
      return res
        .status(201)
        .json({ success: true, message: "User Registered Sucessfully !" });
    }
  } catch (error) {
    console.log(error.message);

    return res.status(400).json({ success: false, message: error.message });
  }
};


const uploadImageToCloudinary = async (fileBuffer) => {
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "CargoMerge" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(fileBuffer);
    });

    const result = await uploadPromise;
    console.log("Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("Image upload failed");
  }
};