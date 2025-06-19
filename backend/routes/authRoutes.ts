import { Router } from "express";
import User from "../models/User"; // Adjust path if needed
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user by email, request password field explicitly
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      console.log(`Login failed: user not found or no password for email ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: incorrect password for email ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET env variable is not set");
      return res.status(500).json({ message: "Server misconfiguration" });
    }
    const expiresIn = process.env.JWT_EXPIRE || "30d";
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
