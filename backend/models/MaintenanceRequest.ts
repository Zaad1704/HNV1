import mongoose, { Schema, Document, model } from 'mongoose';

export interface IMaintenanceRequest extends Document {
    propertyId: mongoose.Schema.Types.ObjectId;
    organizationId: mongoose.Schema.Types.ObjectId;
    requestedBy: mongoose.Schema.Types.ObjectId;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Completed';
}

const MaintenanceRequestSchema: Schema<IMaintenanceRequest> = new Schema({
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
}, { timestamps: true });

export default model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
