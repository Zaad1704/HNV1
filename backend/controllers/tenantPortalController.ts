import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const getDashboard = async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      nextRentDue: '2024-01-01',
      balance: 1200,
      maintenanceRequests: 2
    }
  });
};

export const getMaintenanceRequests = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: [] });
};

export const createMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { id: 'maint_123' } });
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: [] });
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { id: 'payment_123' } });
};

export const getPortal = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: {} });
};

export const getStatement = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: {} });
};

export const getStatementPdf = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { url: 'statement.pdf' } });
};