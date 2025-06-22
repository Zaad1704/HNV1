// backend/models/Reminder.ts

import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IReminder extends Document {
  organizationId: Types.ObjectId;
  tenantId: Types.ObjectId; // The tenant this reminder is for
  propertyId: Types.ObjectId; // The property related to the reminder
  type: 'email_rent_reminder' | 'app_rent_reminder' | 'sms_rent_reminder'; // Type of reminder
  message?: string; // Custom message for the reminder
  nextRunDate: Date; // The next scheduled date for this reminder to be sent
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; // How often it should repeat
  status: 'active' | 'inactive' | 'sent' | 'failed'; // Status of the reminder record
  lastSentDate?: Date; // Last time this reminder was sent
  sentCount: number; // How many times this reminder has been sent
}

const ReminderSchema: Schema<IReminder> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  type: { 
    type: String, 
    enum: ['email_rent_reminder', 'app_rent_reminder', 'sms_rent_reminder'], 
    required: true 
  },
  message: { type: String },
  nextRunDate: { type: Date, required: true },
  frequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'sent', 'failed'], 
    default: 'active' 
  },
  lastSentDate: { type: Date },
  sentCount: { type: Number, default: 0 },
}, { timestamps: true });

export default model<IReminder>('Reminder', ReminderSchema);
