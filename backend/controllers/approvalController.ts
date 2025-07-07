import { Request, Response } from 'express';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

// Approval model schema
const ApprovalSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['expense', 'maintenance', 'payment', 'tenant_action', 'property_action'],
    required: true 
  },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  resourceType: { type: String, required: true },
  action: { type: String, required: true }, // 'create', 'update', 'delete'
  data: { type: mongoose.Schema.Types.Mixed }, // Original data
  reason: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

const Approval = mongoose.models.Approval || mongoose.model('Approval', ApprovalSchema);

export const getApprovals = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const approvals = await Approval.find({ 
      organizationId: req.user.organizationId 
    })
    .populate('requestedBy', 'name email role')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createApprovalRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { type, resourceId, resourceType, action, data, reason } = req.body;

    const approval = await Approval.create({
      organizationId: req.user.organizationId,
      requestedBy: req.user._id,
      type,
      resourceId,
      resourceType,
      action,
      data,
      reason,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateApproval = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { status, notes } = req.body;
    const approval = await Approval.findById(req.params.id);

    if (!approval || approval.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Approval not found' });
    }

    // Only landlords can approve/reject
    if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Only landlords can approve requests' });
    }

    approval.status = status;
    approval.notes = notes;
    approval.approvedBy = req.user._id;
    
    if (status === 'approved') {
      approval.approvedAt = new Date();
    } else if (status === 'rejected') {
      approval.rejectedAt = new Date();
    }

    await approval.save();

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};