import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const getEditRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const editRequests = [
      {
        _id: '1',
        type: 'tenant_update',
        title: 'Update tenant contact information',
        description: 'Request to update phone number for tenant John Doe',
        requestedBy: { name: 'Property Manager', email: 'pm@example.com' },
        status: 'pending',
        createdAt: new Date(),
        data: { tenantId: '123', newPhone: '+1234567890' }
      }
    ];

    res.status(200).json({ success: true, data: editRequests });
  } catch (error) {
    console.error('Error fetching edit requests:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

export const createEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const editRequest = {
      _id: Date.now().toString(),
      ...req.body,
      organizationId: req.user.organizationId,
      requestedBy: req.user._id,
      status: 'pending',
      createdAt: new Date()
    };

    res.status(201).json({ success: true, data: editRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const editRequest = {
      _id: id,
      status,
      notes,
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    };

    res.json({ success: true, data: editRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};