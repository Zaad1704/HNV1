import { Request, Response } from 'express';

export const getCMSContent = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCMSContent = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: req.body });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};