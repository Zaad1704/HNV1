import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import EditRequest from '../models/EditRequest';
import CashFlow from '../models/CashFlow';
import { createNotification } from '../services/notificationService';
import { Types } from 'mongoose'; 

export const createEditRequest = asyncHandler(async (req: Request, res: Response) => {
    const { resourceId, resourceModel, reason, approverId } = req.body;
    const requester = req.user!;

    if (!resourceId || !resourceModel || !reason || !approverId) {
        res.status(400);
        throw new Error('Resource details, reason, and approver are required.');
    }
    
    if(resourceModel === 'CashFlow') {
        const resource = await CashFlow.findById(resourceId);
        if(!resource || resource.organizationId.toString() !== requester.organizationId?.toString()){
            res.status(404);
            throw new Error('Resource not found in your organization.');
        }
    }

    const newRequest = await EditRequest.create({
        resourceId: new Types.ObjectId(resourceId as string),
        resourceModel,
        reason,
        requester: requester._id,
        approver: new Types.ObjectId(approverId as string),
        organizationId: requester.organizationId,
        status: 'pending',
    });
    
    const message = `${requester.name} has requested permission to edit a ${resourceModel} record.`;
    await createNotification({
        userId: new Types.ObjectId(approverId as string),
        organizationId: requester.organizationId!,
        type: 'info',
        title: 'Edit Request',
        message,
        link: '/dashboard/approvals'
    });

    res.status(201).json({ success: true, data: newRequest });
});

export const getEditRequests = asyncHandler(async (req: Request, res: Response) => {
    const approverId = req.user!._id;
    const requests = await EditRequest.find({ approver: approverId, status: 'pending' })
        .populate('requester', 'name email')
        .populate({
            path: 'resourceId',
            model: 'CashFlow'
        }); 
        
    res.status(200).json({ success: true, data: requests });
});

export const approveEditRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await EditRequest.findById(req.params.id);

    if (!request || request.approver.toString() !== req.user!._id.toString()) {
        res.status(404);
        throw new Error('Request not found or you are not authorized to approve it.');
    }

    request.status = 'approved';
    await request.save();

    const message = `Your request to edit a ${request.resourceModel} record has been approved.`;
    await createNotification({
        userId: request.requester,
        organizationId: request.organizationId,
        type: 'success',
        title: 'Request Approved',
        message,
        link: '/dashboard/cashflow'
    });

    res.status(200).json({ success: true, data: request });
});

export const rejectEditRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await EditRequest.findById(req.params.id);
    
    if (!request || request.approver.toString() !== req.user!._id.toString()) {
        res.status(404);
        throw new Error('Request not found or you are not authorized to reject it.');
    }

    await request.deleteOne();
    
    const message = `Your request to edit a ${request.resourceModel} record has been rejected.`;
    await createNotification({
        userId: request.requester,
        organizationId: request.organizationId,
        type: 'error',
        title: 'Request Rejected',
        message,
        link: '/dashboard/cashflow'
    });

    res.status(200).json({ success: true, message: 'Request rejected successfully.' });
});
