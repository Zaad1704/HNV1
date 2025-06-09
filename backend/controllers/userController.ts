// FIX: Removed the duplicate import line.
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

// Get current user info
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    // This correctly uses the custom req.user property.
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// You will likely need other functions in this file,
// such as for updating a user profile.
/*
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  // ... your code
}
*/
