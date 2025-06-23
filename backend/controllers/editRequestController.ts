import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import EditRequest from '../models/EditRequest';
import CashFlow from '../models/CashFlow';
import notificationService from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Re-import AuthenticatedRequest

/**
 * @desc    Agent creates a request to edit a resource
 * @route   POST /api/edit-requests
 * @access  Private (Agent)
 */
export const createEditRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { resourceId, resourceModel, reason, approverId } = req.body;
    const requester = req.user!;

    if (!resourceId || !resourceModel || !reason || !approverId) {
        res.status(400);
        throw new Error('Resource details, reason, and approver are required.');
    }
    
    // Optional: Check if the resource exists and belongs to the org
    if(resourceModel === 'CashFlow') {
        const resource = await CashFlow.findById(resourceId);
        if(!resource || resource.organizationId.toString() !== requester.organizationId?.toString()){
            res.status(404);
            throw new Error('Resource not found in your organization.');
        }
    }

    const newRequest = await EditRequest.create({
        resourceId,
        resourceModel,
        reason,
        requester: requester._id,
        approver: approverId,
        organizationId: requester.organizationId,
        status: 'pending',
    });
    
    // Create a notification for the approver (Landlord)
    const message = `${requester.name} has requested permission to edit a ${resourceModel} record.`;
    // The link should point to the page where landlords can approve requests
    await notificationService.createNotification(approverId, requester.organizationId!, message, '/dashboard/approvals');

    res.status(201).json({ success: true, data: newRequest });
});

/**
 * @desc    Landlord gets their pending approval requests
 * @route   GET /api/edit-requests
 * @access  Private (Landlord)
 */
export const getEditRequests = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const approverId = req.user!._id;
    const requests = await EditRequest.find({ approver: approverId, status: 'pending' })
        .populate('requester', 'name email')
        .populate({
            path: 'resourceId',
            model: 'CashFlow' // Specify the model to populate from
        }); 
        
    res.status(200).json({ success: true, data: requests });
});

/**
 * @desc    Landlord approves a request
 * @route   PUT /api/edit-requests/:id/approve
 * @access  Private (Landlord)
 */
export const approveEditRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const request = await EditRequest.findById(req.params.id);

    if (!request || request.approver.toString() !== req.user!._id.toString()) {
        res.status(404);
        throw new Error('Request not found or you are not authorized to approve it.');
    }

    request.status = 'approved';
    await request.save();

    // Notify the original requester that their request was approved
    const message = `Your request to edit a ${request.resourceModel} record has been approved.`;
    await notificationService.createNotification(request.requester, request.organizationId, message, '/dashboard/cashflow');

    res.status(200).json({ success: true, data: request });
});

/**
 * @desc    Landlord rejects a request
 * @route   PUT /api/edit-requests/:id/reject
 * @access  Private (Landlord)
 */
export const rejectEditRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const request = await EditRequest.findById(req.params.id);
    
    if (!request || request.approver.toString() !== req.user!._id.toString()) {
        res.status(404);
        throw new Error('Request not found or you are not authorized to reject it.');
    }

    // You can either delete the request or mark it as rejected.
    // Deleting it keeps the pending list clean.
    await request.deleteOne();
    
    // Notify the original requester
    const message = `Your request to edit a ${request.resourceModel} record has been rejected.`;
    await notificationService.createNotification(request.requester, request.organizationId, message, '/dashboard/cashflow');

    res.status(200).json({ success: true, message: 'Request rejected successfully.' });
});
