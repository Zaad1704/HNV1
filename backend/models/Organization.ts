// FILE: backend/models/Organization.ts
import mongoose, { Schema, Document, model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  subscription: {
    plan: string;
    status: string;
    tcoCustomerId?: string;
    subscriptionId?: string;
    endsAt?: Date;
  };
  createdAt: Date;
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  subscription: {
    plan: { type: String, default: 'Free' },
    status: { type: String, default: 'trialing' },
    tcoCustomerId: String,
    subscriptionId: String,
    endsAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

export default model<IOrganization>('Organization', OrganizationSchema);
