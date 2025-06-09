// ADDED: Import for the Property model
// CORRECT
import Property from '../models/Property';
import { Request, Response, NextFunction } from 'express';

// FIX: Added the types to the function parameters
export async function getOrgProperties(req: Request, res: Response, next: NextFunction) {
  try {
    // This now relies on the custom type definition update in Part 2
    const orgId = req.organizationId; 
    const properties = await Property.find({ organizationId: orgId });
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

// You will likely need other functions in this file, for example:
/*
export async function createProperty(req: Request, res: Response, next: NextFunction) {
  // ... your code
}
*/
