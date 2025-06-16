import { Response } from 'express';
import Property from '../models/Property';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

// ... (getProperties, getPropertyById, etc. remain the same)

export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // The user check is still necessary to ensure authentication.
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // NO MORE MANUAL VALIDATION NEEDED HERE.
    // The zod middleware handles it before this function is ever called.

    const propertyData = {
      ...req.body, // The body is now guaranteed to be valid.
      organizationId: req.user.organizationId as mongoose.Types.ObjectId,
      createdBy: req.user.id as mongoose.Types.ObjectId,
    };
    
    const property = await Property.create(propertyData);

    auditService.recordAction(
      req.user._id as mongoose.Types.ObjectId,
      req.user.organizationId as mongoose.Types.ObjectId,
      'PROPERTY_CREATE',
      {
        propertyId: (property._id as mongoose.Types.ObjectId).toString(),
        propertyName: property.name
      }
    );

    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    // The catch block now primarily handles database or unexpected server errors.
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ... (updateProperty and deleteProperty functions)
