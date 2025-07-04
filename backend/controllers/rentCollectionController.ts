import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import rentCollectionService from '../services/rentCollectionService';
import RentCollectionPeriod from '../models/RentCollectionPeriod';
import CollectionAction from '../models/CollectionAction';
import CollectionSheet from '../models/CollectionSheet';
import path from 'path';

export const getCollectionPeriod = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { year, month } = req.params;
  const organizationId = req.user!.organizationId.toString();

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) { res.status(400).json({ }
      success: false,
      message: 'Invalid year or month'

    });
    return;

  let period = await RentCollectionPeriod.findOne({ organizationId,
    'period.year': yearNum,
    'period.month': monthNum; }

  });

  if (!period) { // Generate new period
    period = await rentCollectionService.generateCollectionPeriod(organizationId, yearNum, monthNum); }


  } else { // Update existing period if it's older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (period.lastUpdated < oneHourAgo) { }
      await rentCollectionService.updateCollectionPeriod(period);


  res.json({ success: true,
    data: period; }


  });
});

export const generateCollectionPeriod = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { year, month } = req.params;
  const organizationId = req.user!.organizationId.toString();

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) { res.status(400).json({ }
      success: false,
      message: 'Invalid year or month'

    });
    return;

  const period = await rentCollectionService.generateCollectionPeriod(organizationId, yearNum, monthNum);

  res.json({ success: true,
    data: period; }

  });
});

export const createCollectionSheet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { periodId } = req.params;
  const options = req.body;

  const period = await RentCollectionPeriod.findOne({ _id: periodId,
    organizationId: req.user!.organizationId; }

  });

  if (!period) { res.status(404).json({ }
      success: false,
      message: 'Collection period not found'


    });
    return;

  // Create collection sheet record
  const sheet = new CollectionSheet({
    organizationId: req.user!.organizationId,
    periodId,
    createdBy: req.user!._id,
    format: options.format || {},
    sections: options.sections || {},
    customization: options.customization || {}
  });

  await sheet.save();

  // Generate PDF
  const filePath = await rentCollectionService.generateCollectionSheet(periodId, options);
  const fileName = path.basename(filePath);

  // Update sheet with result
  sheet.result = {
    fileUrl: `/api/rent-collection/sheet/${sheet._id}/download`
  res.setHeader('Content-Disposition', `attachment; filename="${sheet.result.fileName}"`