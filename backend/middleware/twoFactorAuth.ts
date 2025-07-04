import { Request, Response, NextFunction    } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';
export const generateTwoFactorSecret: async ($1) => { if ( ) {
};
    res.status(401).json({ success: false, message: 'Not authorized'  });
    return;
  const secret: speakeasy.generateSecret({
name: `HNV Property (${req.user.email
})```