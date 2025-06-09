import { Request, Response, NextFunction } from 'express';
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
