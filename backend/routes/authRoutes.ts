import { Router } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

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

    // Make sure jwtSecret is of type Secret (string | Buffer)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET env variable is not set");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // Make sure expiresIn is a string literal or a number (e.g., "30d" or 3600)
    const expiresIn: string | number = process.env.JWT_EXPIRE ? String(process.env.JWT_EXPIRE) : "30d";

    // Correct usage: secret is Secret, options is object (do NOT pass callback!)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret as Secret,
      { expiresIn: expiresIn }
    );

    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
