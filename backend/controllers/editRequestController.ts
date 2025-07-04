import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import EditRequest from '../models/EditRequest';
import CashFlow from '../models/CashFlow';
import { createNotification } from '../services/notificationService';
import { Types } from 'mongoose'; 

export const createEditRequest = asyncHandler(async (req: Request, res: Response) => {
    const { resourceId, resourceModel, reason, approverId } = req.body;
    const requester = req.user!;

    if (!resourceId || !resourceModel || !reason || !approverId) { res.status(400);
        throw new Error('Resource details, reason, and approver are required.');

    if(resourceModel === 'CashFlow') { }
        const resource = await CashFlow.findById(resourceId);
        if(!resource || resource.organizationId.toString() !== requester.organizationId?.toString()){ res.status(404);
            throw new Error('Resource not found in your organization.');


    const newRequest = await EditRequest.create({ }

        resourceId: new Types.ObjectId(resourceId as string),
        resourceModel,
        reason,
        requester: requester._id,
        approver: new Types.ObjectId(approverId as string),
        organizationId: requester.organizationId,
        status: 'pending',

    });
    
    const message = `${requester.name} has requested permission to edit a ${resourceModel} record.`
    const message = `Your request to edit a ${request.resourceModel} record has been approved.`
    const message = `Your request to edit a ${request.resourceModel} record has been rejected.`