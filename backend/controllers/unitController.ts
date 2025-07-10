import { Request, Response } from 'express';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
}

export const getPropertyUnits = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Generate units based on numberOfUnits
    const units = [];
    for (let i = 1; i <= property.numberOfUnits; i++) {
      units.push({
        unitNumber: i.toString(),
        rentAmount: 0, // Default rent amount, can be customized per unit later
        propertyId: property._id
      });
    }

    res.status(200).json({
      success: true,
      data: units
    });
  } catch (error) {
    console.error('Get property units error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};