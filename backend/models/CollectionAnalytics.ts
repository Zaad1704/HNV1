import mongoose, { Schema, Document, model } from 'mongoose';

export interface ICollectionAnalytics extends Document {
  organizationId: mongoose.Types.ObjectId;
  period: {
    start: Date;
    end: Date;
    type: 'monthly' | 'quarterly' | 'yearly';
  };
  
  performance: {
    collectionRate: number;
    averageDaysToCollect: number;
    totalCollected: number;
    totalOutstanding: number;
    trends: {
      collectionRateChange: number;
      outstandingChange: number;
      averageDaysChange: number;
    };
  };
  
  breakdown: {
    byProperty: Array<{
      propertyId: mongoose.Types.ObjectId;
      name: string;
      collectionRate: number;
      totalDue: number;
      collected: number;
      outstanding: number;
      tenantCount: number;
    }>;
    
    byPaymentMethod: {
      online: { percentage: number; amount: number };
      check: { percentage: number; amount: number };
      cash: { percentage: number; amount: number };
      other: { percentage: number; amount: number };
    };
    
    byTiming: {
      early: { count: number; percentage: number };
      onTime: { count: number; percentage: number };
      late: { count: number; percentage: number };
    };
  };
  
  problemTenants: Array<{
    tenantId: mongoose.Types.ObjectId;
    name: string;
    property: string;
    daysLate: number;
    amountOwed: number;
    missedPayments: number;
    riskScore: 'high' | 'medium' | 'low';
  }>;
  
  generatedAt: Date;
}

const CollectionAnalyticsSchema: Schema<ICollectionAnalytics> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  
  period: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    type: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true }
  },
  
  performance: {
    collectionRate: { type: Number, required: true },
    averageDaysToCollect: { type: Number, required: true },
    totalCollected: { type: Number, required: true },
    totalOutstanding: { type: Number, required: true },
    trends: {
      collectionRateChange: { type: Number, default: 0 },
      outstandingChange: { type: Number, default: 0 },
      averageDaysChange: { type: Number, default: 0 }
    }
  },
  
  breakdown: {
    byProperty: [{
      propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
      name: String,
      collectionRate: Number,
      totalDue: Number,
      collected: Number,
      outstanding: Number,
      tenantCount: Number
    }],
    
    byPaymentMethod: {
      online: { percentage: Number, amount: Number },
      check: { percentage: Number, amount: Number },
      cash: { percentage: Number, amount: Number },
      other: { percentage: Number, amount: Number }
    },
    
    byTiming: {
      early: { count: Number, percentage: Number },
      onTime: { count: Number, percentage: Number },
      late: { count: Number, percentage: Number }
    }
  },
  
  problemTenants: [{
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    name: String,
    property: String,
    daysLate: Number,
    amountOwed: Number,
    missedPayments: Number,
    riskScore: { type: String, enum: ['high', 'medium', 'low'] }
  }],
  
  generatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default model<ICollectionAnalytics>('CollectionAnalytics', CollectionAnalyticsSchema);