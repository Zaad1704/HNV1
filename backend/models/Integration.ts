import mongoose, { Schema, Document, model } from 'mongoose';

export interface IIntegration extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  type: 'payment' | 'accounting' | 'background_check' | 'marketing' | 'email';
  provider: 'stripe' | 'quickbooks' | 'zillow' | 'mailgun' | 'twilio';
  
  config: {
    apiKey?: string; // Encrypted
    webhookUrl?: string;
    settings: Record<string, any>;
    isActive: boolean;
  };
  
  sync: {
    lastSyncAt?: Date;
    nextSyncAt?: Date;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    errors: string[];
  };
  
  usage: {
    apiCalls: number;
    dataTransferred: number;
    lastUsed?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;

const IntegrationSchema: Schema<IIntegration> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['payment', 'accounting', 'background_check', 'marketing', 'email'], 
    required: true 
  },
  provider: { 
    type: String, 
    enum: ['stripe', 'quickbooks', 'zillow', 'mailgun', 'twilio'], 
    required: true 
  },
  
  config: {
    apiKey: String, // Will be encrypted
    webhookUrl: String,
    settings: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true }
  },
  
  sync: {
    lastSyncAt: Date,
    nextSyncAt: Date,
    syncFrequency: { 
      type: String, 
      enum: ['realtime', 'hourly', 'daily'], 
      default: 'daily' 
    },
    errors: [String]
  },
  
  usage: {
    apiCalls: { type: Number, default: 0 },
    dataTransferred: { type: Number, default: 0 },
    lastUsed: Date

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default model<IIntegration>('Integration', IntegrationSchema);