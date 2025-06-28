import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { emailService } from '../services/emailService';

interface TwoFactorRequest extends Request {
  user?: any;
  twoFactorToken?: string;
}

export class TwoFactorAuth {
  private static generateToken(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private static generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async initiateTwoFactor(userId: string): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(userId, {
      twoFactorToken: token,
      twoFactorExpires: expiresAt
    });

    return token;
  }

  static async sendTwoFactorCode(user: any): Promise<void> {
    const token = await this.initiateTwoFactor(user._id);
    
    await emailService.sendEmail(
      user.email,
      'Two-Factor Authentication Code',
      'twoFactorAuth',
      {
        userName: user.name,
        code: token,
        expiresIn: '10 minutes'
      }
    );
  }

  static async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    const user = await User.findById(userId);
    
    if (!user || !user.twoFactorToken || !user.twoFactorExpires) {
      return false;
    }

    if (new Date() > user.twoFactorExpires) {
      // Clear expired token
      await User.findByIdAndUpdate(userId, {
        $unset: { twoFactorToken: 1, twoFactorExpires: 1 }
      });
      return false;
    }

    if (user.twoFactorToken !== code) {
      return false;
    }

    // Clear used token
    await User.findByIdAndUpdate(userId, {
      $unset: { twoFactorToken: 1, twoFactorExpires: 1 }
    });

    return true;
  }

  static requireTwoFactor = async (req: TwoFactorRequest, res: Response, next: NextFunction) => {
    try {
      const { twoFactorCode } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user has 2FA enabled
      if (!user.twoFactorEnabled) {
        return next(); // Skip 2FA if not enabled
      }

      if (!twoFactorCode) {
        // Send 2FA code
        await this.sendTwoFactorCode(user);
        return res.status(200).json({
          success: true,
          message: 'Two-factor authentication code sent',
          requiresTwoFactor: true
        });
      }

      // Verify 2FA code
      const isValid = await this.verifyTwoFactorCode(userId, twoFactorCode);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired two-factor code'
        });
      }

      next();
    } catch (error) {
      console.error('Two-factor auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Two-factor authentication failed'
      });
    }
  };

  static async enableTwoFactor(userId: string): Promise<string> {
    const secret = this.generateSecret();
    
    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: true,
      twoFactorSecret: secret
    });

    return secret;
  }

  static async disableTwoFactor(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      twoFactorEnabled: false,
      $unset: { 
        twoFactorSecret: 1,
        twoFactorToken: 1,
        twoFactorExpires: 1
      }
    });
  }
}