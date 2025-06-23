import { Request, Response } from 'express';
import Property from '../models/Property';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

export const createProperty = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const imageUrl = req.file ? (req.file as any).imageUrl : undefined;

    const property = await Property.create({
      ...req.body,
      imageUrl: imageUrl,
      organizationId: user.organizationId,
      createdBy: user._id
    });

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProperties = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const properties = await Property.find({ organizationId: user.organizationId });
        res.status(200).json({ success: true, data: properties });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getPropertyById = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (!property.organizationId.equals(user.organizationId)) {
            res.status(403).json({ success: false, message: 'Not authorized to view this property' });
            return;
        }
        res.status(200).json({ success: true, data: property });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateProperty = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }
    if (!property.organizationId.equals(user.organizationId)) {
      res.status(403).json({ success: false, message: 'Not authorized to update this property' });
      return;
    }

    const updates = { ...req.body };
    if (req.file) {
        updates.imageUrl = (req.file as any).imageUrl;
    }

    property = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (!property.organizationId.equals(user.organizationId)) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
            return;
        }
        await property.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
