import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';

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

    // Get occupied units
    const tenants = await Tenant.find({ 
      propertyId: propertyId,
      organizationId: user.organizationId,
      status: { $ne: 'Archived' }
    });
    
    const occupiedUnits = tenants.map(t => t.unit).filter(Boolean);

    // Generate units based on numberOfUnits
    const units = [];
    const numberOfUnits = property.numberOfUnits || 1;
    
    for (let i = 1; i <= numberOfUnits; i++) {
      const unitNumber = i.toString();
      const isOccupied = occupiedUnits.includes(unitNumber);
      const tenant = tenants.find(t => t.unit === unitNumber);
      
      units.push({
        unitNumber,
        rentAmount: tenant?.rentAmount || 0,
        isOccupied,
        propertyId: property._id,
        tenantId: tenant?._id,
        tenantName: tenant?.name
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

export const getVacantUnits = async (req: AuthRequest, res: Response) => {
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

    // Get occupied units
    const tenants = await Tenant.find({ 
      propertyId: propertyId,
      organizationId: user.organizationId,
      status: { $ne: 'Archived' }
    });
    
    const occupiedUnits = tenants.map(t => t.unit).filter(Boolean);

    // Generate vacant units
    const vacantUnits = [];
    const numberOfUnits = property.numberOfUnits || 1;
    
    for (let i = 1; i <= numberOfUnits; i++) {
      const unitNumber = i.toString();
      if (!occupiedUnits.includes(unitNumber)) {
        // Get last rent amount from previous tenant if available
        const lastTenant = await Tenant.findOne({
          propertyId: propertyId,
          unit: unitNumber,
          organizationId: user.organizationId
        }).sort({ createdAt: -1 });
        
        vacantUnits.push({
          unitNumber,
          lastRentAmount: lastTenant?.rentAmount || 0,
          suggestedRent: lastTenant?.rentAmount || 0,
          propertyId: property._id
        });
      }
    }

    res.status(200).json({
      success: true,
      data: vacantUnits
    });
  } catch (error: any) {
    console.error('Get vacant units error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};