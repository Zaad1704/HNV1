import mongoose, { Document, Schema } from "mongoose";

export interface PropertyDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  address?: string;
  // Add any other fields as needed
}

const PropertySchema = new Schema<PropertyDocument>({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  name: { type: String, required: true },
  address: { type: String }
  // Add other fields as needed
});

const Property = mongoose.model<PropertyDocument>("Property", PropertySchema);

export default Property;