import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

// Client error logging endpoint
router.post('/errors', asyncHandler(async (req: Request, res: Response) => {
  const { error, userAgent, url, timestamp, userId } = req.body;
  
  // Log client-side errors
  console.error('Client Error:', {
    error,
    userAgent,
    url,
    timestamp,
    userId,
    ip: req.ip
  });
  
  // In production, you might want to save to database or send to monitoring service
  
  res.json({ success: true, message: 'Error logged successfully' });
}));

export default router;