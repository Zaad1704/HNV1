import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.user?.role} is not authorized to access this route` });
    }
    next();
  };
};

// ==========================================================

// FILE: backend/controllers/authController.ts
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

// ==========================================================

// FILE: backend/routes/authRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const authRouter = Router();
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/me', protect, getMe);
export default authRouter;

// ==========================================================

// FILE: backend/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user!.id, { name }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }
    user.password = newPassword;
    await user.save();
    // Re-issue a token
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token });
  } catch (error) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
