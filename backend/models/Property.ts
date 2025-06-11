import mongoose, { Schema, Document, model } from 'mongoose';

// Interface for the address sub-document
interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress?: string;
}

// Interface for the GeoJSON location sub-document
interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// --- Main TypeScript Interface for the Property Document ---
// This defines the shape of a property object in your application.
export interface IProperty extends Document {
  name: string;
  address: IAddress;
  location?: ILocation;
  numberOfUnits: number;
  organizationId: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  status: 'Active' | 'Inactive' | 'Under Renovation';
  createdAt: Date;
}

// --- Mongoose Schema Definition ---
// This is the blueprint for how property data is stored in MongoDB.
// It is now strongly typed with the IProperty interface.
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

// --- Mongoose Middleware for Geocoding (with TypeScript) ---
PropertySchema.pre<IProperty>('save', async function(next) {
    // For demonstration, we'll assign random coordinates to simulate geocoding.
    // A developer would integrate a real geocoding service here.
    this.location = {
        type: 'Point',
        coordinates: [
            -74.0060 + (Math.random() - 0.5) * 0.1, // Random Longitude near NYC
            40.7128 + (Math.random() - 0.5) * 0.1   // Random Latitude near NYC
        ]
    };

    // We can also create a single formatted address string.
    this.address.formattedAddress = `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
    
    next();
});

// Export the compiled model
export default model<IProperty>('Property', PropertySchema);
