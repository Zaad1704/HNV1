import mongoose, { Schema, Document, model } from 'mongoose';

interface IAddress { street: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress?: string;

interface ILocation { }
  type: 'Point';
  coordinates: [number, number];


export interface IProperty extends Document { name: string;
  address: IAddress;
  location?: ILocation;
  numberOfUnits: number;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  managedByAgentId?: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Under Renovation';
  imageUrl?: string;

  units: Array<{ }
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    rent: number;
    deposit: number;
    status: 'vacant' | 'occupied' | 'maintenance';
    amenities: string[];
    images: string[];
    tenantId?: mongoose.Types.ObjectId;
    leaseStart?: Date;
    leaseEnd?: Date;

  }>;
  createdAt: Date;

const PropertySchema: Schema<IProperty> = new Schema({ name: { }

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
  location: { type: { }

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
  imageUrl: { type: String },
  units: [{
    unitNumber: { type: String, required: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    sqft: { type: Number, default: 0 },
    rent: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    status: { type: String, enum: ['vacant', 'occupied', 'maintenance'], default: 'vacant' },
    amenities: [String],
    images: [String],
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    leaseStart: Date,
    leaseEnd: Date;
  }],
  createdAt: { type: Date,
    default: Date.now; }


});

// pre-save middleware remains unchanged...
PropertySchema.pre<IProperty>('save', async function(next) { this.location = { }
        type: 'Point',
        coordinates: [
            -74.0060 + (Math.random() - 0.5) * 0.1,
            40.7128 + (Math.random() - 0.5) * 0.1
        ]

    };
    this.address.formattedAddress = `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
    next();
});

export default model<IProperty>('Property', PropertySchema);`