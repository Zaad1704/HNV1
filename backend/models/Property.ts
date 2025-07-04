import { Schema, model, Document } from 'mongoose';

export interface IProperty extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    formattedAddress?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  numberOfUnits: number;
  organizationId: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  managedByAgentId?: Schema.Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Under Renovation';
  occupancyRate?: number;
  cashFlow?: {
    income: number;
    expenses: number;
  };
  maintenanceStatus?: string;
  imageUrl?: string;
  createdAt: Date;
}

const PropertySchema = new Schema<IProperty>({
  name: {
    type: String,
    required: [true, 'Please add a property name'],
    trim: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    formattedAddress: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  },
  numberOfUnits: {
    type: Number,
    required: true,
    default: 1,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  managedByAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Renovation'],
    default: 'Active',
  },
  occupancyRate: {
    type: Number,
    default: 0
  },
  cashFlow: {
    income: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 }
  },
  maintenanceStatus: {
    type: String,
    default: 'normal'
  },
  imageUrl: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PropertySchema.pre('save', async function(next) {
  this.location = {
    type: 'Point',
    coordinates: [
      -74.0060 + (Math.random() - 0.5) * 0.1,
      40.7128 + (Math.random() - 0.5) * 0.1
    ]
  };
  this.address.formattedAddress = `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
  next();
});

export default model<IProperty>('Property', PropertySchema);