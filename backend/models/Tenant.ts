import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  propertyId?: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
  unit: string;
  status: 'Active' | 'Inactive' | 'Late' | 'Archived';
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  leaseDuration?: number;
  rentAmount: number;
  securityDeposit?: number;
  advanceRent?: number;
  imageUrl?: string;
  tenantImage?: string;
  govtIdNumber?: string;
  govtIdFront?: string;
  govtIdBack?: string;
  fatherName?: string;
  motherName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  occupation?: string;
  monthlyIncome?: number;
  previousAddress?: string;
  reasonForMoving?: string;
  petDetails?: string;
  vehicleDetails?: string;
  specialInstructions?: string;
  numberOfOccupants?: number;
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
  documents?: Array<{
    url: string;
    filename: string;
    description: string;
    uploadedAt: Date;
  }>;
  uploadedImages?: Array<{
    url: string;
    description: string;
    uploadedAt: Date;
  }>;
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
  whatsappNumber: { type: String },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  unit: { type: String },
  status: { type: String, enum: ['Active', 'Inactive', 'Late', 'Archived'], default: 'Active' },
  leaseStartDate: { type: Date },
  leaseEndDate: { type: Date },
  leaseDuration: { type: Number, default: 12 },
  rentAmount: { type: Number, default: 0 },
  securityDeposit: { type: Number, default: 0 },
  advanceRent: { type: Number, default: 0 },
  imageUrl: { type: String },
  tenantImage: { type: String },
  govtIdNumber: { type: String },
  govtIdFront: { type: String },
  govtIdBack: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  presentAddress: { type: String },
  permanentAddress: { type: String },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },
  occupation: { type: String },
  monthlyIncome: { type: Number },
  previousAddress: { type: String },
  reasonForMoving: { type: String },
  petDetails: { type: String },
  vehicleDetails: { type: String },
  specialInstructions: { type: String },
  numberOfOccupants: { type: Number, default: 1 },
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
    relation: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    permanentAddress: { type: String },
    govtIdNumber: { type: String },
    govtIdImageUrl: { type: String },
    imageUrl: { type: String },
  }],
  discountAmount: { type: Number, default: 0 },
  discountExpiresAt: { type: Date },
  documents: [{
    url: { type: String },
    filename: { type: String },
    description: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  uploadedImages: [{
    url: { type: String },
    description: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
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