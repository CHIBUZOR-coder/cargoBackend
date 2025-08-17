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
  } = req.body;

  console.log("reqbody:", req.body);
  console.log("file:", req.file);

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
      "INSERT INTO users (firstname, lastname, email, phone, address, password, image) VALUES($1, $2, $3, $4, $5, $6, $7) Returning * ",
      [firstname, lastname, email, phone, address, hashedPassword, imageUrl]
    );

    const verificationLink = `http://localhost:5173/verifyEmail?token=${verifyEmailToken}`;

    const message = "Click the link below to verify your account";
    sendVerificationEmail(email, verificationLink, message);

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
          <img src="https://res.cloudinary.com/dtjgj2odu/image/upload/v1734469383/ThiaLogo_nop3yd.png" 
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
      border: 5px solid #0B0F29; color: #F20000; text-decoration: none; font-weight: bold; border-radius: 5px;"
      onmouseover="this.style.background='#FFF'; this.style.color='#0B0F29';"
      onmouseout="this.style.background='#0B0F29'; this.style.color='#F20000';">Verify Account</a>
      
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

// export const verifyEmail = async (req, res) => {
//   const { token } = req.body;
//   console.log("req.body:", req.body);

//   if (!token) {
//     return res.status(400).json({
//       success: false,
//       message: "Token and email are required",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.EMAIL_SECRET); // Use your JWT secret key

//     if (!decoded) {
//       return res.status(401).json({ success: false, message: "Invalid token" });
//     }
//     // Extract email
//     const { email } = decoded;

//     // const user = await prisma.user.findUnique({
//     //   where: { email },
//     //   select: { id: true },
//     // });

//     const user = await client.query("SELECT * FROM userr WHERE email = $1", [
//       email,
//     ]);
//     if (!user.rowCount === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Unable to find user" });
//     }

//     // Update user in database (set resetToken to true or handle verification logic)
//     // await prisma.user.update({
//     //   where: { id: user.id },
//     //   data: { status: true },
//     // });

//     await client.query("UPDATE userr SET verified = TRUE WHERE email = $1", [
//       email,
//     ]);
//     // If verification is successful, send a success response
//     return res.status(200).json({
//       success: true,
//       message: "Email verified successfully",
//       data: decoded, // Optionally send decoded data
//     });
//   } catch (error) {
//     console.error("Email verification error:", error.message);
//     return res
//       .status(500)
//       .json({ success: false, message: "Email verification failed" });
//   }
// };

const uploadImageToCloudinary = async (fileBuffer, resourceType) => {
  try {
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: resourceType, folder: "CargoMerge" },
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
