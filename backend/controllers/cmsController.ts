import { Request, Response, NextFunction } from "express";
import CMSContent from "../models/CMSContent";
import { Request, Response, NextFunction } from 'express';

// Get all content (for SuperAdmin)
export async function getAllContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await CMSContent.find();
    res.json(items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}));
  } catch (err) {
    next(err);
  }
}

// Update or create content item
export async function updateContent(req: Request, res: Response, next: NextFunction) {
  try {
    const updates = req.body; // { key: value, ... }
    const userId = req.user.id;
    const keys = Object.keys(updates);

    const results = [];
    for (const key of keys) {
      const value = updates[key];
      const updated = await CMSContent.findOneAndUpdate(
        { key },
        { value, updatedBy: userId, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      results.push(updated);
    }
    res.json({ success: true, updated: results });
  } catch (err) {
    next(err);
  }
}
