import pool from "../db.js"; // ✅ Triggers pool setup
import dotenv from "dotenv";
import bcrypt, { compare } from "bcrypt";
import { cloudinary } from "../config/cloudinary.js";
import jwt from "jsonwebtoken";
import { transporter } from "../config/email.js";
import {
  generateToken,
  ResetPasswordToken,
} from "../middlewares/generateToken.js";

dotenv.config();

export const getTransporter = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transporters");
    res.json(result.rows);
  } catch (error) {
    console.error("DB error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const registerTransporter = async (req, res) => {
  const {
    name,
    description,
    port_location,
    vehicle_number,
    license_number,
    email,
    phone,
    password,
    confirmpassword,
  } = req.body;

  console.log("reqbody:", req.body);
  console.log("file:", req.file);

  try {
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: " Firstname is missing" });
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
   if (!port_location) {
      return res
        .status(400)
        .json({ success: false, message: "Port location is missing" });
    }
    // if (!vehicle_number) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "Vehicle number is missing" });
    // }
    // if (!license_number) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "License number is missing" });
    // }
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

    // Generate email verification token
    const verifyEmailToken = jwt.sign({ email }, process.env.EMAIL_SECRET, {
      expiresIn: "1h",
    });

    if (existingUser.rowCount > 0)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const newUser = await pool.query(
      "INSERT INTO users (name,  port_location, email, phone, description, password, image, vehicle_number, license_number) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) Returning * ",
      [name, port_location, email, phone, description, hashedPassword, imageUrl, vehicle_number, license_number]
    );

    const verificationLink = `https://cargo-merge.vercel.app/verifyEmail?token=${verifyEmailToken}`;

    const message = "Click the link below to verify your account";
    sendVerificationEmail(email, verificationLink, message);

    if (newUser.rowCount > 0) {
      return res.status(201).json({
        success: true,
        message: `User registered successfully. Please check ${email} for verification.`,
      });
    }
  } catch (error) {
    console.log(error.message);

    return res.status(400).json({ success: false, message: error.message });
  }
};

const sendVerificationEmail = async (email, verificationLink, message) => {
  const mailOptions = {
    from: {
      name: "CargoMerge",
      address: process.env.EMAIL_HOST_USER,
    },
    to: email,
    subject: "Email Verification",
    html: `
  <div style="width: 100%; padding:10px 0; max-width: 600px; margin: auto; text-align: center;
  font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="height: 300px;">
      <tr>
      <td style="text-align: center; padding: 20px;">
          <img src="https://res.cloudinary.com/de3iibogu/image/upload/v1755464837/logo-modified_ahi0l7.png" 
          alt="Thia's Apparel Logo" width="120" height="120" 
          style="max-width: 100%; display: block; margin: auto; border-radius: 50%;">
        </td>
      </tr>
    </table>
    

 <div style="padding: 10px; color:  #0B0F29;">
     
      <p  style="display: inline-block; padding: 12px 24px; background: #F1ECEC; 
      border: 5px solid #0B0F29; color: #656363; text-decoration: none; font-weight: bold; border-radius: 5px;">
      ${message}</p>

      <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #0B0F29; 
      border: 5px solid #0B0F29; color: #eadd8e; text-decoration: none; font-weight: bold; border-radius: 5px;"
      onmouseover="this.style.background='#FFF'; this.style.color='#0B0F29';"
      onmouseout="this.style.background='#0B0F29'; this.style.color='#eadd8e';">Verify Account</a>
      
      <p style="font-size: 16px;">If you did not request this, please ignore this email.</p>
    </div>




    



  </div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  console.log("req.body:", req.body);

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token and email are required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET); // Use your JWT secret key

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    // Extract email
    const { email } = decoded;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!user.rowCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to find user" });
    }

    await pool.query("UPDATE users SET verified = TRUE WHERE email = $1", [
      email,
    ]);
    // If verification is successful, send a success response
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: decoded, // Optionally send decoded data
    });
  } catch (error) {
    console.error("Email verification error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Email verification failed" });
  }
};

const uploadImageToCloudinary = async (fileBuffer, resourceType) => {
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: resourceType, folder: "transportersImages" },
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

export const loginuser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("req body:", req.body);
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields must not be empty" });
    }

    // Fetch user from database
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rowCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }
    const user = result.rows[0];

    // Validate password
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect" });
    }

    // Initialize verification token
    let verifyEmailToken = "";

    // Handle unverified users gfg
    if (user.verified !== true) {
      console.log("Unverified user");

      verifyEmailToken = jwt.sign({ email }, process.env.EMAIL_SECRET, {
        expiresIn: "1h",
      });

      const verificationLink = `https://cargo-merge.vercel.app/verifyEmail/verifyEmail?token=${verifyEmailToken}`;
      sendVerificationEmail(email, verificationLink);

      return res.status(400).json({
        success: true,
        message:
          "You have not verified your email. A link to verify your accout has been sent to your emmail",
      });
    }

    // Generate authentication token
    const token = generateToken(user);
    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    // Clear previous authentication cookies
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
    });

    // Set new authentication cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 7200000), // 2 hours expiration
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "You are now logged in",
      role: user.role,
      userInfo: {
        email: user.email,
        phone: user.phone,
        image: user.image,
        id: user.id,
        role: user.role,
        firstname: user.firstname,
        lasttname: user.lastname,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error({ message: error.message });
    res.status(500).json({ success: false, message: "Server error" });
  }
};
