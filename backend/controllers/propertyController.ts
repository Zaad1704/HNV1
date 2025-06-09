// backend/controllers/propertyController.ts

import { Request, Response, NextFunction } from 'express';
// FIX: Corrected the import path to match the filename 'Property.ts'
import Property from '../models/Property'; 

export async function getOrgProperties(req: Request, res: Response, next: NextFunction) {
  try {
    // This relies on your custom type definition for 'req.organizationId'
    const orgId = req.organizationId; 
    const properties = await Property.find({ organizationId: orgId });
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

// Placeholder for other functions you might add
/*
export async function createProperty(req: Request, res: Response, next: NextFunction) {
  // ... your code to create a property
}
*/
