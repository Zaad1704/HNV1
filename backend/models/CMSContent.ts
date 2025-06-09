import mongoose, { Document, Schema } from "mongoose";

export interface ICMSContent extends Document {
  key: string;
  value: string;
  updatedBy: string; // user id
  updatedAt: Date;
}

const CMSContentSchema = new Schema<ICMSContent>({
  key: { type: String, required: true, unique: true }, // e.g., 'homeTitle'
  value: { type: String, required: true },
  updatedBy: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICMSContent>("CMSContent", CMSContentSchema);