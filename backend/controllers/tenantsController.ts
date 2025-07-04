import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

export const getTenants = async (req: Request, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    const tenants = await Tenant.find({ organizationId: req.user.organizationId }).populate('propertyId', 'name');
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });

};

export const createTenant = async (req: Request, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    const { propertyId } = req.body;
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(400).json({ success: false, message: 'Invalid property selected.' });
        return;

    const tenantData = { ...req.body, organizationId: req.user.organizationId };
    const tenant = await Tenant.create(tenantData);
    
    auditService.recordAction(
        req.user._id,
        req.user.organizationId,
        'TENANT_CREATE',
        {
            tenantId: (tenant._id as mongoose.Types.ObjectId).toString(), 
            tenantName: tenant.name,
            propertyId: (property._id as mongoose.Types.ObjectId).toString() 

    );
    res.status(201).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });

};

export const getTenantById = async (req: Request, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;

    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'User not authorized to access this tenant' });
      return;

    res.status(200).json({ success: true, data: tenant });

   catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });

};

export const updateTenant = async (req: Request, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    const originalTenant = await Tenant.findById(req.params.id).lean();
    if (!originalTenant) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;

    if (originalTenant.organizationId.toString() !== req.user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'User not authorized to update this tenant' });
      return;

    const updatedTenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (updatedTenant) {
        const changes = {};
        for (const key in req.body) {
            if ((originalTenant as any)[key] !== (updatedTenant as any)[key]) {
                (changes as any)[key] = {
                    from: (originalTenant as any)[key] || 'undefined',
                    to: (updatedTenant as any)[key]
                };


        auditService.recordAction(
            req.user._id,
            req.user.organizationId,
            'TENANT_UPDATE',
            { 
                tenantId: (updatedTenant._id as mongoose.Types.ObjectId).toString(), 
                tenantName: updatedTenant.name,
                ...(Object.keys(changes).length > 0 && { changes })

        );

    res.status(200).json({ success: true, data: updatedTenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });

};

export const deleteTenant = async (req: Request, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found' });
      return;

    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'User not authorized to delete this tenant' });
      return;

    await tenant.deleteOne();
    
    auditService.recordAction(
        req.user._id,
        req.user.organizationId,
        'TENANT_DELETE',
        { tenantId: (tenant._id as mongoose.Types.ObjectId).toString(), tenantName: tenant.name } 
    );
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });

};
