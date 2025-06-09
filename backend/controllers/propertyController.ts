// backend/controllers/propertyController.ts

import { Request, Response, NextFunction } from 'express';
// FIX: The import path must match the filename exactly, including capitalization.
import Property from '../models/Property'; 

export async function getOrgProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const orgId = req.organizationId; 
    const properties = await Property.find({ organizationId: orgId });
    res.json(properties);
  } catch (err) {
    next(err);
  }
}
