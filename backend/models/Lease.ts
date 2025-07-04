import mongoose, { Schema, Document, model } from 'mongoose';

export interface ILease extends Document { propertyId: mongoose.Schema.Types.ObjectId;
  tenantId: mongoose.Schema.Types.ObjectId;
  organizationId: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  rentAmount: number;

  status: 'active' | 'expired' | 'terminated'; }


const LeaseSchema: Schema<ILease> = new Schema({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentAmount: { type: Number, required: true },
  status: { type: String, enum: ['active', 'expired', 'terminated'], default: 'active' },
}, { timestamps: true });

export default model
export default model<ILease>('Lease', LeaseSchema);
