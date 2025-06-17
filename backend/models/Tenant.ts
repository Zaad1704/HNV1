import mongoose, { Schema, Document, model } from 'mongoose';

interface IAdditionalAdult {
    name: string;
    phone?: string;
    idCardUrl?: string;
}

interface IReference {
  name: string;
  phone?: string;
  email?: string;
}

export interface ITenant extends Document {
  name: string;
  email: string;
  phone?: string;
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  unit: string;
  status: 'Active' | 'Inactive' | 'Late';
  leaseEndDate?: Date;
  imageUrl?: string;
  idCardUrl?: string;
  reference?: IReference;
  gender?: 'Male' | 'Female' | 'Other';
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  numberOfOccupants?: number;
  additionalAdults?: IAdditionalAdult[];
  createdAt: Date;
}

const TenantSchema: Schema<ITenant> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  unit: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Late'], default: 'Active' },
  leaseEndDate: { type: Date },
  imageUrl: { type: String },
  idCardUrl: { type: String },
  reference: {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  fatherName: { type: String },
  motherName: { type: String },
  spouseName: { type: String },
  numberOfOccupants: { type: Number },
  additionalAdults: [{
    name: { type: String },
    phone: { type: String },
    idCardUrl: { type: String },
  }],
}, { timestamps: true });

export default model<ITenant>('Tenant', TenantSchema);
