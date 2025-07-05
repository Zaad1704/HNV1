import { Request, Response } from 'express';
import User from '../models/User';
import SiteSettings from '../models/SiteSettings';

interface AuthRequest extends Request {
  user?: any;
}

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const siteSettings = await SiteSettings.findOne();
    
    res.json({
      success: true,
      data: {
        user,
        siteSettings: siteSettings || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, notifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, notifications },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: user,
      message: 'Settings updated successfully'
    });
  } catch (error) {
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
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};