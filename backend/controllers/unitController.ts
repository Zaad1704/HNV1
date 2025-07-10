import { Request, Response } from 'express';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
}

export const getPropertyUnits = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { propertyId } = req.params;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    if (property.organizationId.toString() !== user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Generate units based on numberOfUnits with safety check
    const units = [];
    const numberOfUnits = property.numberOfUnits || 1;
    
    for (let i = 1; i <= numberOfUnits; i++) {
      units.push({
        unitNumber: i.toString(),
        rentAmount: 0,
        propertyId: property._id
      });
    }

    res.status(200).json({
      success: true,
      data: units
    });
  } catch (error: any) {
    console.error('Get property units error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};