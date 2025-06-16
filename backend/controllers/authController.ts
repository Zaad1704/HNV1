import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }
  if (role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot register a Super Admin account.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with that email already exists' });
    }

    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
        return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
    }

    // Step 1: Create the organization document.
    const organization = new Organization({ name: `${name}'s Organization` });

    // Step 2: Create the user document, linking the organization's ID.
    const user: IUser = new User({
        name,
        email,
        password,
        role,
        organizationId: organization._id,
    });
    
    // Step 3: Save both main documents.
    await organization.save();
    await user.save();

    // Step 4: Now that both exist in the DB, update the organization with the finalized user ID.
    // This two-step process is the most robust way to ensure type safety.
    organization.owner = user._id;
    organization.members = [user._id];

    // Step 5: Create and link the subscription.
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const subscription = new Subscription({
        organizationId: organization._id,
        planId: trialPlan._id,
        status: 'trialing',
        trialExpiresAt: trialEndDate,
    });
    organization.subscription = subscription._id;

    // Step 6: Save the updated organization and the new subscription.
    await organization.save();
    await subscription.save();

    // Step 7: Log the action and send the response.
    auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if
