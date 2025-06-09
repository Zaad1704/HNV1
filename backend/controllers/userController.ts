import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { Request, Response, NextFunction } from 'express';

// Get current user info
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}
