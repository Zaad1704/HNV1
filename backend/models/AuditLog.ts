import mongoose, { Schema, Document, model } from 'mongoose';

export interface IAuditLog extends Document {
    user: mongoose.Schema.Types.ObjectId;
    action: string;
    organizationId: mongoose.Schema.Types.ObjectId;
    details: Map<string, string>;
    timestamp: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    details: { type: Map, of: String },
    timestamp: { type: Date, default: Date.now },
});

export default model<IAuditLog>('AuditLog', AuditLogSchema);
