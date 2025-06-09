import mongoose from 'mongoose';
const AuditLogSchema = new mongoose.Schema({
  userId: String,
  action: String,
  timestamp: { type: Date, default: Date.now },
  details: Object,
});
export default mongoose.model('AuditLog', AuditLogSchema);