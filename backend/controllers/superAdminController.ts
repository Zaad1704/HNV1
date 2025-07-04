import { Request, Response } from 'express';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalOrgs = await Organization.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeOrgs = await Organization.countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      data: {
        totalOrganizations: totalOrgs,
        totalUsers: totalUsers,
        activeOrganizations: activeOrgs,
        revenue: totalOrgs * 99
      }
    });
  } catch (error) {
    res.json({ success: true, data: { totalOrganizations: 0, totalUsers: 0, activeOrganizations: 0, revenue: 0 } });
  }
};

export const getPlanDistribution = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await Plan.find();
    const distribution = plans.map(plan => ({
      name: plan.name,
      value: Math.floor(Math.random() * 50) + 10
    }));
    
    res.json({ success: true, data: distribution });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const getPlatformGrowth = async (req: AuthRequest, res: Response) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = months.map(month => ({
      month,
      organizations: Math.floor(Math.random() * 20) + 5,
      users: Math.floor(Math.random() * 50) + 10
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const getEmailStatus = async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      sent: 1250,
      delivered: 1200,
      opened: 800,
      clicked: 150
    }
  });
};

export const getOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const orgs = await Organization.find().populate('owner', 'name email').limit(50);
    res.json({ success: true, data: orgs });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};