import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Generate a signed JWT for a given user ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Return a safe user object (no password, no internal fields).
 */
const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// ────────────────────────────────────────────
//  POST /api/auth/register
// ────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email is already taken
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409);
      throw new Error("Email already registered");
    }

    // Create user — password is hashed via the pre-save hook
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (error) {
    // Surface Mongoose validation errors clearly
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      res.status(400);
      return next(new Error(messages.join(", ")));
    }
    next(error);
  }
};

// ────────────────────────────────────────────
//  POST /api/auth/login
// ────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    // Explicitly select password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────
//  GET /api/auth/me  (protected)
// ────────────────────────────────────────────
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: safeUser(req.user),
  });
};

// ────────────────────────────────────────────
//  POST /api/auth/logout
//  Client-side operation — this endpoint exists
//  for completeness / future token blacklisting.
// ────────────────────────────────────────────
export const logout = (req, res) => {
  res.json({
    success: true,
    message: "Logged out — clear the token on the client",
  });
};
