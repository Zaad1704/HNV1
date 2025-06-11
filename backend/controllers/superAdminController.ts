import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import User from '../models/User';
import Organization from '../models/Organization';
import auditService from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * @desc    Get editable site content for a specific page.
 * @route   GET /api/super-admin/content/:page
 * @access  Private (Super Admin)
 */
export const getSiteContent = async (req: Request, res: Response) => {
  try {
    let content = await SiteContent.findOne({ page: req.params.page });
    if (!content) {
      // If no content exists for this page yet, create a default entry
      content = await SiteContent.create({
        page: req.params.page,
        content: {
          title: `Welcome to the ${req.params.page} page`,
          subtitle: 'This content is editable by the Super Admin.'
        }
      });
    }
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update site content for a specific page.
 * @route   PUT /api/super-admin/content/:page
 * @access  Private (Super Admin)
 */
export const updateSiteContent = async (req: Request, res: Response) => {
  try {
    const pageContent = await SiteContent.findOneAndUpdate(
      { page: req.params.page },
      { content: req.body, lastUpdated: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: pageContent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get a list of all users across all organizations.
 * @route   GET /api/super-admin/users
 * @access  Private (Super Admin)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).populate('organizationId', 'name').select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get a list of all organizations.
 * @route   GET /api/super-admin/organizations
 * @access  Private (Super Admin)
 */
export const getAllOrganizations = async (req: Request, res: Response) => {
    try {
        const organizations = await Organization.find({}).populate('owner', 'name').select('-members');
        res.status(200).json({ success: true, count: organizations.length, data: organizations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Manually update an organization's subscription status.
 * @route   POST /api/super-admin/organizations/:orgId/subscription
 * @access  Private (Super Admin)
 */
export const updateOrganizationSubscription = async (req: AuthenticatedRequest, res: Response) => {
  const { orgId } = req.params;
  const { action, durationDays } = req.body;

  if (!action || (action === 'activate' && !durationDays)) {
    return res.status(400).json({ success: false, message: 'Please provide an action and a duration for activation.' });
  }

  try {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    if (action === 'activate') {
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + parseInt(durationDays, 10));
      
      organization.subscription.status = 'active';
      organization.subscription.renewalDate = renewalDate;
    } else if (action === 'deactivate') {
      organization.subscription.status = 'inactive';
      organization.subscription.renewalDate = undefined; // Clear renewal date
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    await organization.save();
    
    auditService.recordAction(req.user!._id, req.user!.organizationId, 'SUBSCRIPTION_MANUAL_UPDATE', {
        targetOrgId: orgId,
        targetOrgName: organization.name,
        action: action,
        duration: durationDays ? `${durationDays} days` : 'N/A'
    });

    res.status(200).json({ success: true, data: organization });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
