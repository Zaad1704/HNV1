import { Request, Response } from 'express';
import Reminder from '../models/Reminder';

interface AuthRequest extends Request {
  user?: any;
}

export const getReminders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const reminders = await Reminder.find({ organizationId: req.user.organizationId })
      .populate('tenantId', 'name email unit')
      .populate('propertyId', 'name')
      .sort({ nextRunDate: 1 });

    res.status(200).json({ success: true, data: reminders || [] });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

export const createReminder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { tenantId, type, message, frequency, nextRunDate } = req.body;

    const reminder = await Reminder.create({
      organizationId: req.user.organizationId,
      tenantId,
      type,
      message,
      nextRunDate: new Date(nextRunDate),
      frequency,
      status: 'active',
      sentCount: 0
    });

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};