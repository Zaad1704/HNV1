import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IReminder extends Document {
  organizationId: Types.ObjectId;
  tenantId: Types.ObjectId;
  propertyId: Types.ObjectId;
  type: 'rent_reminder' | 'maintenance_reminder' | 'lease_reminder';
  message?: string;
  nextRunDate: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'completed' | 'failed';
  lastSentAt?: Date;
  sentCount: number;
  createdBy?: Types.ObjectId;
}

const ReminderSchema: Schema<IReminder> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  type: { 
    type: String, 
    enum: ['rent_reminder', 'maintenance_reminder', 'lease_reminder'], 
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
    enum: ['active', 'inactive', 'completed', 'failed'], 
    default: 'active' 
  },
  lastSentAt: { type: Date },
  sentCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model<IReminder>('Reminder', ReminderSchema);