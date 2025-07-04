import { Request, Response } from 'express';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });

};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, data: req.body });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });

};