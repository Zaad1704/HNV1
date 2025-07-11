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