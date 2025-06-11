import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import emailService from '../services/emailService';
import auditService from '../services/auditService';

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    try {
        if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'User already exists' });
        const organization = new Organization({ name: `${name}'s Organization`, members: [] });
        const user = new User({ name, email, password, role, organizationId: organization._id });
        organization.owner = user._id;
        organization.members.push(user._id);
        await organization.save();
        await user.save();
        auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
        sendTokenResponse(user, 201, res);
    } catch (error) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    auditService.recordAction(user._id, user.organizationId, 'USER_LOGIN');
    sendTokenResponse(user, 200, res);
};
export const getMe = async (req: AuthenticatedRequest, res: Response) => { res.status(200).json({ success: true, data: req.user }); };
