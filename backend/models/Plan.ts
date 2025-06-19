import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the structure of the limits object within a plan
interface IPlanLimits {
  maxProperties: number;
  maxUnits: number;
  maxAgents: number;
  maxTenants: number;
}

// Export this interface so other files (like your controller) can use it for type-checking.
export interface IPlan extends Document {
  _id: Types.ObjectId;
  name: string;
  price: number;
  features: string[];
  limits: IPlanLimits;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    limits: {
      maxProperties: { type: Number, default: 0 },
      maxUnits: { type: Number, default: 0 },
      maxAgents: { type: Number, default: 0 },
      maxTenants: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPlan>('Plan', planSchema);
