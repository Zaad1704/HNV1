import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import exportService from '../services/exportService';
import ExportTemplate from '../models/ExportTemplate';
import path from 'path';

export const createExportRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { type, format, filters = {}, options = {} } = req.body;

  if (!type || !format) {
    res.status(400).json({
      success: false,
      message: 'Type and format are required'
    });
    return;

  const validTypes = ['properties', 'tenants', 'payments', 'maintenance', 'expenses'];
  const validFormats = ['pdf', 'csv', 'excel'];

  if (!validTypes.includes(type)) {
    res.status(400).json({
      success: false,
      message: 'Invalid export type'
    });
    return;

  if (!validFormats.includes(format)) {
    res.status(400).json({
      success: false,
      message: 'Invalid export format'
    });
    return;

  const exportRequest = await exportService.createExportRequest({
    organizationId: req.user!.organizationId,
    userId: req.user!._id,
    type,
    format,
    filters,
    options
  });

  res.status(201).json({
    success: true,
    data: exportRequest
  });
});

export const getExportStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const exportRequest = await exportService.getExportStatus(id);

  if (!exportRequest) {
    res.status(404).json({
      success: false,
      message: 'Export request not found'
    });
    return;

  // Check if user has access to this export
  if (exportRequest.organizationId.toString() !== req.user!.organizationId.toString()) {
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
    return;

  res.json({
    success: true,
    data: exportRequest
  });
});

export const downloadExport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const exportRequest = await exportService.getExportStatus(id);

  if (!exportRequest) {
    res.status(404).json({
      success: false,
      message: 'Export request not found'
    });
    return;

  // Check if user has access to this export
  if (exportRequest.organizationId.toString() !== req.user!.organizationId.toString()) {
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
    return;

  if (exportRequest.status !== 'completed') {
    res.status(400).json({
      success: false,
      message: 'Export is not ready for download'
    });
    return;

  const filePath = await exportService.getExportFile(id);

  if (!filePath) {
    res.status(404).json({
      success: false,
      message: 'Export file not found or expired'
    });
    return;

  const fileName = exportRequest.result?.fileName || 'export';
  const contentType = exportRequest.format === 'pdf' ? 'application/pdf' : 'text/csv';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"