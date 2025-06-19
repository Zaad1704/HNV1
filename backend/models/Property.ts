import mongoose, { Schema, Document, model } from 'mongoose';

interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress?: string;
}

interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IProperty extends Document {
  name: string;
  address: IAddress;
  location?: ILocation;
  numberOfUnits: number;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // This will always be the Landlord
  managedByAgentId?: mongoose.Types.ObjectId; // NEW: The assigned Agent/Manager
  status: 'Active' | 'Inactive' | 'Under Renovation';
  createdAt: Date;
}

const PropertySchema: Schema<IProperty> = new Schema({
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
  managedByAgentId: { // NEW SCHEMA FIELD
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Renovation'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ... (keep existing PropertySchema.pre middleware)
PropertySchema.pre<IProperty>('save', async function(next) {
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
