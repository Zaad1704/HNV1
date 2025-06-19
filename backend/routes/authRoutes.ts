import { Router } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      console.log(`Login failed: user not found or no password for email ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: incorrect password for email ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET env variable is not set");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // Support both string ("30d") and number (2592000) for expiresIn
    // If JWT_EXPIRE is a number string, use as number (for v9+), else use as string (for v8 or older)
    let expiresIn: string | number = process.env.JWT_EXPIRE || "30d";
    if (/^\d+$/.test(expiresIn)) {
      expiresIn = parseInt(expiresIn, 10);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn }
    );

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
