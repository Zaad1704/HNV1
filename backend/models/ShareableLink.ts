import mongoose, { Document, Schema, model, Types } from 'mongoose';
import crypto from 'crypto';

export interface IShareableLink extends Document {
  token: string;
  documentUrl: string; // The private path to the file, e.g., '/uploads/filename.pdf'
  organizationId: Types.ObjectId;
  expiresAt: Date;

const ShareableLinkSchema = new Schema<IShareableLink>({
  token: { type: String, required: true, unique: true, index: true },
  documentUrl: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Before saving a new link, generate a unique, random token and set an expiration date (e.g., 24 hours)
ShareableLinkSchema.pre<IShareableLink>('validate', function(next) {
    if (this.isNew) {
        this.token = crypto.randomBytes(24).toString('hex');
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Link is valid for 24 hours

    next();
});

export default model<IShareableLink>('ShareableLink', ShareableLinkSchema);
