import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import User from '../models/User';
import Organization from '../models/Organization';
import auditService from '../services/auditService';

// @desc    Get site content for a specific page
// @route   GET /api/super-admin/content/:page
export const getSiteContent = async (req: Request, res: Response) => {
  try {
    let content = await SiteContent.findOne({ page: req.params.page });

    if (!content) {
      content = await SiteContent.create({
        page: req.params.page,
        content: {
          heroTitle: `Welcome to ${req.params.page} page!`,
          heroSubtitle: 'This content is editable by the Super Admin.'
        }
      });
    }

    res.status(200).json({ success: true, data: content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update site content for a specific page
// @route   PUT /api/super-admin/content/:page
export const updateSiteContent = async (req: Request, res: Response) => {
  try {
    const pageContent = await SiteContent.findOneAndUpdate(
      { page: req.params.page },
      { content: req.body, lastUpdated: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: pageContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all users from all organizations
// @route   GET /api/super-admin/users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).populate('organizationId', 'name').select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all organizations
// @route   GET /api/super-admin/organizations
export const getAllOrganizations = async (req: Request, res: Response) => {
    try {
        const organizations = await Organization.find({})
            .populate('owner', 'name')
            .select('-members');

        res.status(200).json({ success: true, count: organizations.length, data: organizations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Manually update an organization's subscription status
// @route   POST /api/super-admin/organizations/:orgId/subscription
export const updateOrganizationSubscription = async (req: any, res: Response) => {
  const { orgId } = req.params;
  const { action, durationDays } = req.body; // action can be 'activate' or 'deactivate'

  if (!action || (action === 'activate' && !durationDays)) {
    return res.status(400).json({ success: false, message: 'Please provide an action and a duration for activation.' });
  }

  try {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    if (action === 'activate') {
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + parseInt(durationDays, 10));
      
      organization.subscription.status = 'active';
      organization.subscription.endsAt = endsAt;
    } else if (action === 'deactivate') {
      organization.subscription.status = 'inactive';
      organization.subscription.endsAt = new Date(); // End it now
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action.' });
    }

    await organization.save();
    
    // Audit Log
    auditService.recordAction(req.user.id, req.user.organizationId, 'SUBSCRIPTION_MANUAL_UPDATE', {
        targetOrgId: orgId,
        targetOrgName: organization.name,
        action: action,
        duration: durationDays ? `${durationDays} days` : 'N/A'
    });

    res.status(200).json({ success: true, data: organization });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
