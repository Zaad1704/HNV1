import { Request, Response } from 'express';
import CashFlow from '../models/CashFlow';

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

export const createCashFlowRecord = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { amount, type, transactionDate, description } = req.body;

    if (!amount || !type || !transactionDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount, type, and transaction date are required' 
      });
    }

    const newRecord = await CashFlow.create({
      organizationId: req.user.organizationId,
      fromUser: req.user._id,
      amount: Number(amount),
      type,
      transactionDate,
      description,
      recordedBy: req.user._id
    });

    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCashFlowRecords = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const records = await CashFlow.find({ 
      organizationId: req.user.organizationId 
    }).sort({ transactionDate: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCashFlowRecord = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const record = await CashFlow.findById(req.params.id);
    if (!record || record.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const updatedRecord = await CashFlow.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCashFlowRecord = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const record = await CashFlow.findById(req.params.id);
    if (!record || record.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await record.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};