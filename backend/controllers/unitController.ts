import { Request, Response } from 'express';
import Unit from '../models/Unit';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import { IUser } from '../models/User';

// Get units for a property
export const getUnits = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const units = await Unit.find({ 
      propertyId, 
      organizationId: (req.user as IUser)?.organizationId 
    }).populate('tenantId', 'name email status');
    
    // Add display name to each unit
    const unitsWithDisplayName = units.map(unit => ({
      ...unit.toObject(),
      displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber
    }));
    
    res.json({ success: true, data: unitsWithDisplayName });
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
      { _id: unitId, organizationId: (req.user as IUser)?.organizationId },
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
      organizationId: (req.user as IUser)?.organizationId 
    });
    
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    const unitDocs = units.map((unit: any) => ({
      ...unit,
      propertyId,
      organizationId: (req.user as IUser)?.organizationId
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
        filter: { _id: update.unitId, organizationId: (req.user as IUser)?.organizationId },
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
      organizationId: (req.user as IUser)?.organizationId,
      tenantId: { $exists: false }
    });
    
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vacant units' });
  }
};

// Search units by number or nickname
export const searchUnits = async (req: Request, res: Response) => {
  try {
    const { query, propertyId } = req.query;
    const filter: any = {
      organizationId: (req.user as IUser)?.organizationId
    };
    
    if (propertyId) {
      filter.propertyId = propertyId;
    }
    
    if (query) {
      filter.$or = [
        { unitNumber: { $regex: query, $options: 'i' } },
        { nickname: { $regex: query, $options: 'i' } },
        { alternativeName: { $regex: query, $options: 'i' } }
      ];
    }
    
    const units = await Unit.find(filter)
      .populate('tenantId', 'name email')
      .populate('propertyId', 'name address')
      .limit(20);
    
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to search units' });
  }
};

// Bulk update unit details (enhanced)
export const bulkUpdateUnits = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    const results = [];
    
    for (const update of updates) {
      const unit = await Unit.findOneAndUpdate(
        { _id: update.unitId, organizationId: (req.user as IUser)?.organizationId },
        {
          nickname: update.nickname || '',
          alternativeName: update.alternativeName || '',
          floor: update.floor || '',
          description: update.description || ''
        },
        { new: true }
      );
      
      if (unit) {
        results.push(unit);
      }
    }
    
    res.json({ success: true, data: results, message: `${results.length} units updated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update units' });
  }
};