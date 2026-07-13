import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * protect — Verify JWT from Authorization: Bearer <token> header,
 * attach the user document to req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized — no token provided");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password)
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error("Not authorized — user no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "JsonWebTokenError") {
      res.status(401);
      return next(new Error("Not authorized — invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      res.status(401);
      return next(new Error("Not authorized — token expired"));
    }
    next(error);
  }
};

/**
 * adminOnly — Must be used AFTER protect.
 * Checks that the authenticated user has the 'admin' role.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  next(new Error("Forbidden — admin access required"));
};

/**
 * optionalProtect — Decodes user session if token exists, but doesn't block request if missing or expired.
 */
export const optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently continue for optional authentication
  }
  next();
};

