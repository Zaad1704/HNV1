import mongoose, { Document, Schema, model, Types } from 'mongoose';
import crypto from 'crypto';

export interface IAgentInvitation extends Document { organizationId: Types.ObjectId;
  inviterId: Types.ObjectId; // The Landlord who sent the invite
  recipientEmail: string;
  role: 'Agent'; // The role being invited
  status: 'pending' | 'accepted' | 'expired';
  token: string;

  expiresAt: Date; }


const AgentInvitationSchema = new Schema<IAgentInvitation>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  inviterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientEmail: { type: String, required: true },
  role: { type: String, required: true, default: 'Agent', enum: ['Agent'] },
  status: { type: String, required: true, default: 'pending', enum: ['pending', 'accepted', 'expired'] },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default model
AgentInvitationSchema.pre<IAgentInvitation>('validate', function(next) { if (this.isNew) { }
        this.token = crypto.randomBytes(32).toString('hex');
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 day expiry;


    next();
});

export default model<IAgentInvitation>('AgentInvitation', AgentInvitationSchema);
