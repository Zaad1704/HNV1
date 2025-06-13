// FILE: backend/controllers/authController.ts
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import { AuthenticatedRequest } from '../middleware/authenticate';

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ success: true, token });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  try {
    const organization = new Organization({ name: `${name}'s Organization`, members: [] });
    const user = new User({ name, email, password, role, organizationId: organization._id });
    organization.owner = user._id;
    organization.members.push(user._id);
    await organization.save();
    await user.save();
    sendTokenResponse(user, 201, res);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    sendTokenResponse(user, 200, res);
};
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({ data: req.user });
};
export const verifyInvite = async (req: Request, res: Response) => { res.status(200).json({ message: 'Invite verified' }); };
export const acceptInvite = async (req: Request, res: Response) => { res.status(200).json({ message: 'Invite accepted' }); };

