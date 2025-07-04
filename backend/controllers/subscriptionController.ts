import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const getStatus = async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'active',
      plan: 'premium',
      expiresAt: '2024-12-31'
    }
  });
};