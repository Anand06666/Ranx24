import jwt from "jsonwebtoken";
import User from "../model/User.js";
import Admin from "../model/Admin.js";
import Worker from "../model/Worker.js";

export const protect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
    return res.status(500).json({ message: "Internal Server Error: Server is not configured properly." });
  }

  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token missing" });
      }

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: "Invalid token" });
      }

      let user = null;

      // Check role and fetch user from appropriate model
      if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id);
        if (user) user.role = 'admin'; // Ensure role is set
      } else if (decoded.role === 'worker') {
        user = await Worker.findById(decoded.id);
        if (user) user.role = 'worker';
      } else {
        // Default to User model
        user = await User.findById(decoded.id);
        if (user) user.role = 'user';
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      req.user.isAdmin = user.role === 'admin';
      return next();
    }

    return res.status(401).json({ message: "No token provided" });
  } catch (error) {
    console.error("Middleware Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
