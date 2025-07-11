import { Request, Response } from 'express';
import Unit from '../models/Unit';
import Property from '../models/Property';
import Tenant from '../models/Tenant';

// Get units for a property
export const getUnits = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const units = await Unit.find({ 
      propertyId, 
      organizationId: req.user?.organizationId 
    }).populate('tenantId', 'name email status');
    
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch units' });
  }
};

// Update unit nickname
export const updateUnitNickname = async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const { nickname, alternativeName } = req.body;
    
    const unit = await Unit.findOneAndUpdate(
      { _id: unitId, organizationId: req.user?.organizationId },
      { nickname, alternativeName },
      { new: true }
    );
    
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }
    
    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update unit' });
  }
};

// Create units for property
export const createUnitsForProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { units } = req.body;
    
    const property = await Property.findOne({ 
      _id: propertyId, 
      organizationId: req.user?.organizationId 
    });
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    const unitDocs = units.map((unit: any) => ({
      ...unit,
      propertyId,
      organizationId: req.user?.organizationId
    }));
    
    const createdUnits = await Unit.insertMany(unitDocs);
    res.json({ success: true, data: createdUnits });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create units' });
  }
};

// Bulk update unit nicknames
export const bulkUpdateUnitNicknames = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body; // Array of { unitId, nickname, alternativeName }
    
    const bulkOps = updates.map((update: any) => ({
      updateOne: {
        filter: { _id: update.unitId, organizationId: req.user?.organizationId },
        update: { 
          nickname: update.nickname, 
          alternativeName: update.alternativeName 
        }
      }
    }));
    
    await Unit.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Units updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update units' });
  }
};

// Get vacant units for a property
export const getVacantUnits = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const units = await Unit.find({ 
      propertyId, 
      organizationId: req.user?.organizationId,
      tenantId: { $exists: false }
    });
    
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vacant units' });
  }
};