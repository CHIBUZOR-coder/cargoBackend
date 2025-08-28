import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  console.log(req.cookies); // Add this line to debug
  const token = req.cookies.auth_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

const verifySubscription = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }
  } catch (error) {
    console.error("Subscription Check Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const verifyAdmin = (req, res, next) => {
  console.log("Cookies received in verifyAdmin:", req.cookies); // Debugging log

  try {
    const token = req.cookies.auth_token;

    if (!token) {
      console.log("Unauthorized - No token");
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    console.log("Decoded Admin Token:", decoded); // Debugging log

    if (decoded.role !== "ADMIN") {
      console.log("Access Denied - User is not an admin");
      return res.status(403).json({ message: "Access Denied - Admins only" });
    }

    next(); // Admin is verified, proceed to route
  } catch (error) {
    console.error("Admin Token Verification Error:", error); // Debugging log
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const verifyEmailToken = (req, res, next) => {
  const token = req.query.token; // Extract token from query parameters

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    req.email = decoded.email; // Attach email to the request object
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = verifyEmailToken;

export { verifyToken, verifyAdmin, verifySubscription, verifyEmailToken };
