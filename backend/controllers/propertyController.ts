import { Request, Response, NextFunction } from 'express';
// FIX: Corrected the import path to match the filename 'Property.ts'
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
