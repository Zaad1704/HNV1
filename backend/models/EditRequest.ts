import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IEditRequest extends Document {
  resourceId: Types.ObjectId; // ID of the CashFlow record
  resourceModel: string; // The model name, e.g., 'CashFlow'
  requester: Types.ObjectId; // The Agent who requested the change
  approver: Types.ObjectId; // The Landlord who needs to approve
  organizationId: Types.ObjectId;
  reason: string; // The reason provided by the agent
  status: 'pending' | 'approved' | 'rejected';

const EditRequestSchema: Schema<IEditRequest> = new Schema({
  resourceId: { type: Schema.Types.ObjectId, required: true },
  resourceModel: { type: String, required: true },
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default model<IEditRequest>('EditRequest', EditRequestSchema);
