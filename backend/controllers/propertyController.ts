import { Request, Response, NextFunction } from 'express';
import Property from '../models/Property';

export async function getOrgProperties(req: Request, res: Response, next: NextFunction) {
  try {
    // If you use custom middleware to attach organizationId, otherwise get from req.user or params.
    const orgId = (req as any).organizationId || req.params.organizationId || req.body.organizationId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required.' });
    }
    const properties = await Property.find({ organizationId: orgId });
    res.json(properties);
  } catch (err) {
    next(err);
  }
}

// You can add other controller functions below as needed, for example:
export async function createProperty(req: Request, res: Response, next: NextFunction) {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
}
