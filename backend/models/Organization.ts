// FILE: backend/models/Organization.ts
import mongoose, { Schema, Document, model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  status: string;
  subscription: {
    plan: string;
    status: string;
    renewalDate?: Date;
  };
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, default: 'active' },
  subscription: {
    plan: { type: String, default: 'Free' },
    status: { type: String, default: 'trialing' },
    renewalDate: Date,
  },
});

export default model<IOrganization>('Organization', OrganizationSchema);
