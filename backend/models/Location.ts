import mongoose, { Schema, Document, model } from 'mongoose';

export interface ILocation extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  manager: mongoose.Types.ObjectId;
  
  properties: mongoose.Types.ObjectId[];
  staff: mongoose.Types.ObjectId[];
  
  settings: {
    timezone: string;
    currency: string;
    localRegulations: Record<string, any>;
    operatingHours: {
      monday: { open: string; close: string };
      tuesday: { open: string; close: string };
      wednesday: { open: string; close: string };
      thursday: { open: string; close: string };
      friday: { open: string; close: string };
      saturday: { open: string; close: string };
      sunday: { open: string; close: string };
    };
  };
  
  performance: {
    revenue: number;
    expenses: number;
    occupancy: number;
    maintenanceRequests: number;
    tenantSatisfaction: number;
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema<ILocation> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'US' }
  },
  
  manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  staff: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  settings: {
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, default: 'USD' },
    localRegulations: { type: Schema.Types.Mixed, default: {} },
    operatingHours: {
      monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '17:00' } },
      tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '17:00' } },
      wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '17:00' } },
      thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '17:00' } },
      friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '17:00' } },
      saturday: { open: { type: String, default: '10:00' }, close: { type: String, default: '14:00' } },
      sunday: { open: { type: String, default: 'closed' }, close: { type: String, default: 'closed' } }
    }
  },
  
  performance: {
    revenue: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    occupancy: { type: Number, default: 0 },
    maintenanceRequests: { type: Number, default: 0 },
    tenantSatisfaction: { type: Number, default: 0 }
  },
  
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default model<ILocation>('Location', LocationSchema);