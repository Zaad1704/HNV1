import mongoose, { Schema, Document, model } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  email: string;
  phone?: string;
  propertyId: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
  unit: string;
  status: 'Active' | 'Inactive' | 'Late';
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
}, { timestamps: true });

export default model<ITenant>('Tenant', TenantSchema);
