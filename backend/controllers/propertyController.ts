import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  // Add other property fields here, e.g.:
  address: { type: String, required: true },
  // etc.
});

const Property = mongoose.model('Property', PropertySchema);

export default Property;
