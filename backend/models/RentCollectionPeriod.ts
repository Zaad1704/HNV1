import mongoose, { Schema, Document, model } from 'mongoose';

export interface IRentCollectionPeriod extends Document {
  organizationId: mongoose.Types.ObjectId;
  period: {
    month: number;
    year: number;
  };
  
  summary: {
    totalUnits: number;
    occupiedUnits: number;
    expectedRent: number;
    collectedRent: number;
    outstandingRent: number;
    collectionRate: number;
    
    breakdown: {
      onTime: { count: number; amount: number };
      late: { count: number; amount: number };
      pending: { count: number; amount: number };
    };
  };
  
  tenants: Array<{
    tenantId: mongoose.Types.ObjectId;
    name: string;
    property: string;
    unit: string;
    rentDue: number;
    lateFees: number;
    totalOwed: number;
    dueDate: Date;
    daysLate: number;
    status: 'paid' | 'overdue' | 'pending';
    
    contact: {
      phone: string;
      email: string;
      preferredMethod: 'phone' | 'email' | 'sms';
    };
    
    paymentHistory: {
      lastPayment?: Date;
      averageDaysLate: number;
      missedPayments: number;
    };
    
    notes?: string;
  }>;
  
  generatedAt: Date;
  lastUpdated: Date;

const RentCollectionPeriodSchema: Schema<IRentCollectionPeriod> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  
  period: {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true }
  },
  
  summary: {
    totalUnits: { type: Number, default: 0 },
    occupiedUnits: { type: Number, default: 0 },
    expectedRent: { type: Number, default: 0 },
    collectedRent: { type: Number, default: 0 },
    outstandingRent: { type: Number, default: 0 },
    collectionRate: { type: Number, default: 0 },
    
    breakdown: {
      onTime: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }
      },
      late: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }
      },
      pending: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 }


  },
  
  tenants: [{
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    property: { type: String, required: true },
    unit: { type: String, required: true },
    rentDue: { type: Number, required: true },
    lateFees: { type: Number, default: 0 },
    totalOwed: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    daysLate: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['paid', 'overdue', 'pending'], 
      default: 'pending' 
    },
    
    contact: {
      phone: String,
      email: String,
      preferredMethod: { 
        type: String, 
        enum: ['phone', 'email', 'sms'], 
        default: 'phone' 

    },
    
    paymentHistory: {
      lastPayment: Date,
      averageDaysLate: { type: Number, default: 0 },
      missedPayments: { type: Number, default: 0 }
    },
    
    notes: String
  }],
  
  generatedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique period per organization
RentCollectionPeriodSchema.index({ organizationId: 1, 'period.year': 1, 'period.month': 1 }, { unique: true });

export default model<IRentCollectionPeriod>('RentCollectionPeriod', RentCollectionPeriodSchema);