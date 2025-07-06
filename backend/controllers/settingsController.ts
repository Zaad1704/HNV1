import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import SiteSettings from '../models/SiteSettings';
import AuditLog from '../models/AuditLog';

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('organizationId')
      .select('-password -twoFactorSecret');
    const siteSettings = await SiteSettings.findOne();
    
    res.json({
      success: true,
      data: {
        user,
        organization: user.organizationId,
        siteSettings: siteSettings || {}
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, notifications, language, autoDetectLanguage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name, 
        email, 
        phone, 
        notifications,
        language,
        autoDetectLanguage
      },
      { new: true }
    ).select('-password -twoFactorSecret');
    
    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      organizationId: user.organizationId,
      action: 'user_settings_updated',
      resource: 'user',
      resourceId: user._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      data: user,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      organizationId: user.organizationId,
      action: 'password_changed',
      resource: 'user',
      resourceId: user._id,
      details: { changedBy: 'user' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, phone, email, website, description } = req.body;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user || !user.organizationId) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const organization = await Organization.findByIdAndUpdate(
      user.organizationId,
      {
        name,
        address,
        phone,
        email,
        website,
        description,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user._id,
      organizationId: organization._id,
      action: 'organization_updated',
      resource: 'organization',
      resourceId: organization._id,
      details: { 
        updatedFields: Object.keys(req.body),
        organizationName: organization.name
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });

    res.json({
      success: true,
      data: organization,
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization'
    });
  }
};

export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const imageUrl = (req.file as any).location;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: imageUrl },
      { new: true }
    ).select('-password -twoFactorSecret');

    res.json({
      success: true,
      data: { user, imageUrl },
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile image'
    });
  }
};

export const uploadOrganizationLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const logoUrl = (req.file as any).location;
    const user = await User.findById(req.user._id);
    
    if (!user || !user.organizationId) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const organization = await Organization.findByIdAndUpdate(
      user.organizationId,
      { logo: logoUrl },
      { new: true }
    );

    res.json({
      success: true,
      data: { organization, logoUrl },
      message: 'Organization logo updated successfully'
    });
  } catch (error) {
    console.error('Upload organization logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading organization logo'
    });
  }
};