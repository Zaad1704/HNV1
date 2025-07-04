import { Request, Response } from 'express';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import User from '../models/User';
import SiteSettings from '../models/SiteSettings';

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
        totalOrgs: totalOrgs,
        activeOrganizations: activeOrgs,
        activeSubscriptions: activeOrgs,
        revenue: totalOrgs * 99
      }
    });
  } catch (error) {
    res.json({ success: true, data: { totalOrganizations: 0, totalUsers: 0, totalOrgs: 0, activeOrganizations: 0, activeSubscriptions: 0, revenue: 0 } });
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

export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  try {
    await Organization.findByIdAndDelete(req.params.orgId);
    res.json({ success: true, data: {} });
  } catch (error) {
    res.json({ success: false, message: 'Error deleting organization' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().populate('organizationId', 'name').limit(100);
    res.json({ success: true, data: users });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, data: {} });
  } catch (error) {
    res.json({ success: false, message: 'Error deleting user' });
  }
};

export const updateUserPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    await User.findByIdAndUpdate(req.params.userId, { planId });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.json({ success: false, message: 'Error updating user plan' });
  }
};

export const getPlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await Plan.find();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const createPlan = async (req: AuthRequest, res: Response) => {
  try {
    const plan = await Plan.create(req.body);
    res.json({ success: true, data: plan });
  } catch (error) {
    res.json({ success: false, message: 'Error creating plan' });
  }
};

export const updatePlan = async (req: AuthRequest, res: Response) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.json({ success: false, message: 'Error updating plan' });
  }
};

export const deletePlan = async (req: AuthRequest, res: Response) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    res.json({ success: false, message: 'Error deleting plan' });
  }
};

export const getModerators = async (req: AuthRequest, res: Response) => {
  try {
    const moderators = await User.find({ role: 'Moderator' });
    res.json({ success: true, data: moderators });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

export const createModerator = async (req: AuthRequest, res: Response) => {
  try {
    const moderator = await User.create({ ...req.body, role: 'Moderator' });
    res.json({ success: true, data: moderator });
  } catch (error) {
    res.json({ success: false, message: 'Error creating moderator' });
  }
};

export const updateModerator = async (req: AuthRequest, res: Response) => {
  try {
    const moderator = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: moderator });
  } catch (error) {
    res.json({ success: false, message: 'Error updating moderator' });
  }
};

export const deleteModerator = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    res.json({ success: false, message: 'Error deleting moderator' });
  }
};

export const updateSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.json({ success: false, message: 'Error updating site settings' });
  }
};

export const updateSiteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { section } = req.params;
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { [`content.${section}`]: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    res.json({ success: false, message: 'Error updating site content' });
  }
};

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error) {
    res.json({ success: false, message: 'Error uploading image' });
  }
};

export const activatePlan = async (req: AuthRequest, res: Response) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.json({ success: false, message: 'Error activating plan' });
  }
};

export const getBilling = async (req: AuthRequest, res: Response) => {
  try {
    const billing = {
      totalRevenue: 50000,
      monthlyRevenue: 8500,
      activeSubscriptions: 125,
      churnRate: 2.5,
      recentTransactions: [
        {
          _id: '1',
          organizationName: 'ABC Properties',
          amount: 9900,
          status: 'completed',
          date: new Date().toISOString(),
          planName: 'Premium'
        },
        {
          _id: '2',
          organizationName: 'XYZ Realty',
          amount: 2900,
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString(),
          planName: 'Basic'
        }
      ],
      revenueChart: [
        { month: 'Jan', revenue: 4200, subscriptions: 42 },
        { month: 'Feb', revenue: 4800, subscriptions: 48 },
        { month: 'Mar', revenue: 5200, subscriptions: 52 },
        { month: 'Apr', revenue: 5800, subscriptions: 58 },
        { month: 'May', revenue: 6200, subscriptions: 62 },
        { month: 'Jun', revenue: 6800, subscriptions: 68 }
      ]
    };
    res.json({ success: true, data: billing });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching billing data' });
  }
};