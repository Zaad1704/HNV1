import mongoose, { Schema, Document, model } from 'mongoose';

// Interface for the optional reference sub-document
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
  imageUrl?: string; // NEW: To store the URL of the tenant's photo
  idCardUrl?: string; // NEW: To store the URL of the ID card scan
  reference?: IReference; // NEW: Optional reference person
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
  imageUrl: { type: String }, // NEW
  idCardUrl: { type: String }, // NEW
  reference: { // NEW
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
}, { timestamps: true });

export default model<ITenant>('Tenant', TenantSchema);
