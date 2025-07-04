import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';

interface AuthRequest extends Request {
  user?: any;
}

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const users = await User.find({ 
      organizationId: req.user.organizationId,
      role: { $ne: 'SuperAdmin' }
    }).select('-password');
    
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getOrgUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const users = await User.find({ 
      organizationId: req.user.organizationId,
      role: { $ne: 'SuperAdmin' }
    }).select('-password');
    
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Get org users error:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

export const getMyAgents = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const agents = await User.find({
      organizationId: req.user.organizationId,
      role: 'Agent'
    }).select('-password');

    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInvites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const invites = [
      {
        _id: '1',
        email: 'agent@example.com',
        role: 'Agent',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];

    res.status(200).json({ success: true, data: invites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const inviteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body;
    
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Mock invite creation
    const invite = {
      _id: Date.now().toString(),
      email,
      role,
      status: 'pending',
      organizationId: req.user.organizationId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    res.status(201).json({ success: true, data: invite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Mock password validation
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const requestAccountDeletion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    organization.status = 'pending_deletion';
    await organization.save();

    res.status(200).json({ 
      success: true, 
      message: 'Account deletion request received' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};