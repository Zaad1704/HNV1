// FIX: Removed the duplicate import line.
import { Request, Response, NextFunction } from "express";
import CMSContent from "../models/CMSContent";

// BEST PRACTICE: Define the shape of the request body for the update function.
// This means the body should be an object with string keys and any type of value.
interface UpdateBody {
  [key: string]: any; 
}

// Get all content (for SuperAdmin)
export async function getAllContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await CMSContent.find();
    // This reduce function is a clever way to transform the array into an object
    res.json(items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}));
  } catch (err) {
    next(err);
  }
}

// Update or create content item
export async function updateContent(req: Request<{}, {}, UpdateBody>, res: Response, next: NextFunction) {
  try {
    const updates = req.body;
    // This relies on your custom type definition for req.user
    const userId = req.user.id; 
    const keys = Object.keys(updates);

    const results = [];
    for (const key of keys) {
      const value = updates[key];
      const updated = await CMSContent.findOneAndUpdate(
        { key },
        { value, updatedBy: userId, updatedAt: new Date() },
        { upsert: true, new: true } // upsert: true will create the document if it doesn't exist
      );
      results.push(updated);
    }
    res.json({ success: true, updated: results });
  } catch (err) {
    next(err);
  }
}
