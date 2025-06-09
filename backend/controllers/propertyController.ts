import { Request, Response, NextFunction } from 'express';
export async function getOrgProperties(req, res, next) {
  try {
    const orgId = req.organizationId;
    const properties = await Property.find({ organizationId: orgId });
    res.json(properties);
  } catch (err) {
    next(err);
  }
}
