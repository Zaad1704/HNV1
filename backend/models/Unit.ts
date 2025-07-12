import { Schema, model, Document } from 'mongoose';

export interface IUnit extends Document {
  propertyId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  unitNumber: string;
  nickname?: string;
  alternativeName?: string;
  floor?: string;
  description?: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  tenantId?: Schema.Types.ObjectId;
  rentAmount?: number;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  historyTracking: {
    totalTenants: number;
    averageStayDuration: number; // in months
    lastOccupiedDate?: Date;
    lastVacatedDate?: Date;
    rentHistory: Array<{
      amount: number;
      effectiveDate: Date;
      tenantId?: Schema.Types.ObjectId;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>({
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  unitNumber: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    trim: true,
  },
  alternativeName: {
    type: String,
    trim: true,
  },
  floor: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'],
    default: 'Available',
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
  },
  rentAmount: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number, // in sq ft
  },
  bedrooms: {
    type: Number,
    default: 1,
  },
  bathrooms: {
    type: Number,
    default: 1,
  },
  amenities: [{
    type: String,
  }],
  historyTracking: {
    totalTenants: { type: Number, default: 0 },
    averageStayDuration: { type: Number, default: 0 },
    lastOccupiedDate: { type: Date },
    lastVacatedDate: { type: Date },
    rentHistory: [{
      amount: { type: Number },
      effectiveDate: { type: Date },
      tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    }],
  },
}, { timestamps: true });

// Index for efficient queries
UnitSchema.index({ propertyId: 1, unitNumber: 1 }, { unique: true });
UnitSchema.index({ organizationId: 1 });
UnitSchema.index({ tenantId: 1 });

// Virtual for display name
UnitSchema.virtual('displayName').get(function() {
  if (this.nickname) {
    return `${this.unitNumber} (${this.nickname})`;
  }
  if (this.alternativeName) {
    return `${this.unitNumber} - ${this.alternativeName}`;
  }
  return this.unitNumber;
});

export default model<IUnit>('Unit', UnitSchema);