import { Request, Response, NextFunction } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';

export const generateTwoFactorSecret = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;

  const secret = speakeasy.generateSecret({
    name: `HNV Property (${req.user.email})