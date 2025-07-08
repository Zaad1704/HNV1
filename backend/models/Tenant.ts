import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  email: string;
  phone?: string;
  propertyId?: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
  unit: string;
  status: 'Active' | 'Inactive' | 'Late' | 'Archived';
  leaseEndDate?: Date;
  rentAmount: number;
  imageUrl?: string;
  govtIdNumber?: string;
  govtIdImageUrlFront?: string;
  govtIdImageUrlBack?: string;
  fatherName?: string;
  motherName?: string;
  permanentAddress?: string;
  reference?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    relation?: string;
    govtIdNumber?: string;
  };
  additionalAdults: Array<{
    name?: string;
    phone?: string;
    fatherName?: string;
    motherName?: string;
    permanentAddress?: string;
    govtIdNumber?: string;
    govtIdImageUrl?: string;
    imageUrl?: string;
  }>;
  discountAmount: number;
  discountExpiresAt?: Date;
  lastRentIncrease?: {
    date: Date;
    oldAmount: number;
    newAmount: number;
    type: 'percentage' | 'fixed';
    value: number;
    reason: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  unit: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Late', 'Archived'], default: 'Active' },
  leaseEndDate: { type: Date },
  rentAmount: { type: Number, default: 0 },
  imageUrl: { type: String },
  govtIdNumber: { type: String },
  govtIdImageUrlFront: { type: String },
  govtIdImageUrlBack: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  permanentAddress: { type: String },
  reference: {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    relation: { type: String },
    govtIdNumber: { type: String },
  },
  additionalAdults: [{
    name: { type: String },
    phone: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    permanentAddress: { type: String },
    govtIdNumber: { type: String },
    govtIdImageUrl: { type: String },
    imageUrl: { type: String },
  }],
  discountAmount: { type: Number, default: 0 },
  discountExpiresAt: { type: Date },
  lastRentIncrease: {
    date: { type: Date },
    oldAmount: { type: Number },
    newAmount: { type: Number },
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number },
    reason: { type: String }
  },
}, { timestamps: true });

export default model<ITenant>('Tenant', TenantSchema);