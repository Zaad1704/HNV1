import { Request, Response, NextFunction } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';

export const generateTwoFactorSecret = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const secret = speakeasy.generateSecret({
    name: `HNV Property (${req.user.email})`,
    issuer: 'HNV Property Management'
  });

  await User.findByIdAndUpdate(req.user._id, {
    twoFactorSecret: secret.base32,
    twoFactorEnabled: false
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  res.json({
    success: true,
    data: {
      secret: secret.base32,
      qrCode: qrCodeUrl
    }
  });
};

export const enableTwoFactor = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const { token } = req.body;
  const user = await User.findById(req.user._id);

  if (!user?.twoFactorSecret) {
    res.status(400).json({ success: false, message: 'Two-factor not set up' });
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });

  if (!verified) {
    res.status(400).json({ success: false, message: 'Invalid token' });
    return;
  }

  await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });
  res.json({ success: true, message: 'Two-factor authentication enabled' });
};

export const verifyTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  const user = await User.findById(req.user._id);
  
  if (!user?.twoFactorEnabled) {
    return next();
  }

  const { twoFactorToken } = req.body;
  
  if (!twoFactorToken) {
    res.status(400).json({ success: false, message: 'Two-factor token required' });
    return;
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret!,
    encoding: 'base32',
    token: twoFactorToken,
    window: 2
  });

  if (!verified) {
    res.status(400).json({ success: false, message: 'Invalid two-factor token' });
    return;
  }

  next();
};