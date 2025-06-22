// backend/controllers/reminderController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Reminder from '../models/Reminder';
import Tenant from '../models/Tenant';
import emailService from '../services/emailService'; // Re-use email service for actual sending
import { addDays, addWeeks, addMonths, addYears } from 'date-fns'; // For calculating next run date

// Helper to calculate next run date
const calculateNextRunDate = (currentDate: Date, frequency: IReminder['frequency']): Date => {
  switch (frequency) {
    case 'daily': return addDays(currentDate, 1);
    case 'weekly': return addWeeks(currentDate, 1);
    case 'monthly': return addMonths(currentDate, 1);
    case 'yearly': return addYears(currentDate, 1);
    default: return addDays(currentDate, 1); // Fallback
  }
};

// @desc    Create a new reminder
// @route   POST /api/reminders
// @access  Private (Landlord, Agent)
export const createReminder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const { tenantId, type, message, frequency, nextRunDate } = req.body;

  if (!tenantId || !type || !frequency || !nextRunDate) {
    res.status(400);
    throw new Error('Tenant, type, frequency, and next run date are required.');
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
    res.status(404);
    throw new Error('Tenant not found in your organization.');
  }

  const reminder = await Reminder.create({
    organizationId: req.user.organizationId,
    tenantId: tenant._id,
    propertyId: tenant.propertyId, // Link to tenant's property
    type,
    message,
    nextRunDate: new Date(nextRunDate),
    frequency,
    status: 'active',
    sentCount: 0,
  });

  res.status(201).json({ success: true, data: reminder });
});

// @desc    Get all reminders for the user's organization
// @route   GET /api/reminders
// @access  Private (Landlord, Agent, Super Admin)
export const getReminders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const query = req.user.role === 'Super Admin' ? {} : { organizationId: req.user.organizationId };

  const reminders = await Reminder.find(query)
    .populate('tenantId', 'name email unit')
    .populate('propertyId', 'name')
    .sort({ nextRunDate: 1 });

  res.status(200).json({ success: true, data: reminders });
});

// @desc    Update a reminder (e.g., status, message, next run date)
// @route   PUT /api/reminders/:id
// @access  Private (Landlord, Agent)
export const updateReminder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const { id } = req.params;
  const updates = req.body;

  const reminder = await Reminder.findById(id);
  if (!reminder || reminder.organizationId.toString() !== req.user.organizationId.toString()) {
    res.status(404);
    throw new Error('Reminder not found or unauthorized.');
  }

  Object.assign(reminder, updates);
  if (updates.nextRunDate) {
    reminder.nextRunDate = new Date(updates.nextRunDate);
  }
  await reminder.save();

  res.status(200).json({ success: true, data: reminder });
});

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private (Landlord, Agent)
export const deleteReminder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const { id } = req.params;

  const reminder = await Reminder.findById(id);
  if (!reminder || reminder.organizationId.toString() !== req.user.organizationId.toString()) {
    res.status(404);
    throw new Error('Reminder not found or unauthorized.');
  }

  await reminder.deleteOne();
  res.status(200).json({ success: true, message: 'Reminder deleted.' });
});

// --- NEW FUNCTION for the scheduled job (runs externally) ---
// This function would be called by a cron job or a separate worker process.
// It iterates through active reminders and sends them.
// @desc    Process and send overdue reminders
// @route   (Internal/Cron Job Triggered) /api/reminders/process-overdue
// @access  Private (Admin-only or internal API key protected)
export const processOverdueReminders = asyncHandler(async (req: Request, res: Response) => {
  // IMPORTANT: This endpoint should be protected by an internal API key or IP whitelist,
  // NOT by standard user authentication, as it's meant for a cron job.
  // For simplicity here, we're assuming it's accessed securely.

  const now = new Date();
  const overdueReminders = await Reminder.find({
    nextRunDate: { $lte: now },
    status: 'active',
  }).populate('tenantId').populate('propertyId');

  let sentCount = 0;
  for (const reminder of overdueReminders) {
    try {
      const tenant = reminder.tenantId as any; // Cast for populated data
      const propertyName = (reminder.propertyId as any)?.name || 'your property';

      if (!tenant || !tenant.email) {
        console.warn(`Reminder ${reminder._id}: Tenant not found or has no email. Skipping.`);
        reminder.status = 'failed';
        await reminder.save();
        continue;
      }

      let subject = `Rent Reminder for ${propertyName} - Unit ${tenant.unit}`;
      let messageBody = reminder.message || `
        <p>Dear ${tenant.name},</p>
        <p>This is a reminder that your rent for Unit ${tenant.unit} at ${propertyName} is due.</p>
        <p>Please ensure your payment is made promptly.</p>
        <p>Thank you.</p>
      `;

      if (reminder.type === 'email_rent_reminder') {
        await emailService.sendEmail(
          tenant.email,
          subject,
          'customMessage', // Use a generic email template
          { senderName: 'The Management', messageBody: messageBody.replace(/\n/g, '<br>') }
        );
        console.log(`Email reminder sent to ${tenant.email} for reminder ${reminder._id}`);
      } 
      // Placeholder for SMS/App reminders - these would call relevant services (B.1, B.2)
      else if (reminder.type === 'sms_rent_reminder') {
        // smsService.sendSms(tenant.phone, `Reminder: Rent due for ${propertyName} - Unit ${tenant.unit}.`);
        console.log(`SMS reminder (mock) for ${tenant.phone} for reminder ${reminder._id}`);
      }
      else if (reminder.type === 'app_rent_reminder') {
        // notificationService.createNotification(tenant._id, tenant.organizationId, `Rent due for ${propertyName} - Unit ${tenant.unit}.`);
        console.log(`App notification (mock) for tenant ${tenant._id} for reminder ${reminder._id}`);
      }

      reminder.status = 'active'; // Reset status to active for next cycle
      reminder.lastSentDate = now;
      reminder.nextRunDate = calculateNextRunDate(now, reminder.frequency); // Schedule next run
      reminder.sentCount += 1;
      await reminder.save();
      sentCount++;

    } catch (error) {
      console.error(`Error processing reminder ${reminder._id}:`, error);
      reminder.status = 'failed';
      await reminder.save();
    }
  }
  res.status(200).json({ success: true, message: `Processed ${sentCount} overdue reminders.` });
});
