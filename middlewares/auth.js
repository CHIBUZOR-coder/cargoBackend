// middlewares/auth.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};




// middlewares/authMiddleware.js
// import jwt from "jsonwebtoken";

// export const authenticateUser = (req, res, next) => {
//   const token = req.cookies.auth_token;
//   if (!token) {
//     return res.status(401).json({ success: false, message: "Not authenticated" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // attach user data to the request
//     next();
//   } catch (error) {
//     return res.status(403).json({ success: false, message: "Invalid or expired token" });
//   }
// };

