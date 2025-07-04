import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const getApprovals = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Mock approvals data for now
    const approvals = [
      {
        _id: '1',
        type: 'Maintenance Request',
        title: 'Plumbing repair in Unit 2A',
        description: 'Tenant reported leaky faucet',
        requestedBy: { name: 'John Doe', email: 'john@example.com' },
        status: 'pending',
        priority: 'medium',
        estimatedCost: 150,
        createdAt: new Date(),
        property: { name: 'Sunset Apartments' },
        unit: '2A'
      },
      {
        _id: '2',
        type: 'Expense Approval',
        title: 'Property maintenance supplies',
        description: 'Monthly maintenance supplies purchase',
        requestedBy: { name: 'Jane Smith', email: 'jane@example.com' },
        status: 'pending',
        priority: 'low',
        estimatedCost: 300,
        createdAt: new Date(Date.now() - 86400000),
        property: { name: 'Oak Street Complex' }
      }
    ];

    res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

export const updateApprovalStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Mock approval update
    const approval = {
      _id: id,
      status,
      notes,
      approvedBy: req.user._id,
      approvedAt: new Date()
    };

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createApproval = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const approval = {
      _id: Date.now().toString(),
      ...req.body,
      organizationId: req.user.organizationId,
      requestedBy: req.user._id,
      status: 'pending',
      createdAt: new Date()
    };

    res.status(201).json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};