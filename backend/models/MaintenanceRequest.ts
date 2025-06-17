// backend/models/MaintenanceRequest.ts

import mongoose, { Schema, Document, model } from 'mongoose';

// Define the interface for a Maintenance Request document
export interface IMaintenanceRequest extends Document {
  organizationId: mongoose.Types.ObjectId; // The organization this request belongs to
  propertyId: mongoose.Types.ObjectId;     // The property the request is for
  tenantId?: mongoose.Types.ObjectId;      // Optional: The tenant who reported it
  description: string;                     // Detailed description of the request
  status: 'Open' | 'In Progress' | 'Completed' | 'Closed' | 'Cancelled'; // Current status
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'; // Priority level
  reportedBy: mongoose.Types.ObjectId;     // The user who reported this (e.g., Tenant, Landlord, Agent)
  assignedTo?: mongoose.Types.ObjectId;    // Optional: The user or vendor assigned to the request
  category?: string;                       // Optional: e.g., 'Plumbing', 'Electrical', 'Appliance'
  notes?: string;                          // Optional: Additional notes
  createdAt: Date;                         // Timestamp of creation
  updatedAt: Date;                         // Timestamp of last update
}

// Define the Mongoose Schema for MaintenanceRequest
const MaintenanceRequestSchema: Schema<IMaintenanceRequest> = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: false, // Optional
  },
  description: {
    type: String,
    required: [true, 'Please add a description for the maintenance request.'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Closed', 'Cancelled'],
    default: 'Open',
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
    required: true,
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Can be assigned to another user (e.g., agent, landlord) or a vendor (if you have a vendor model)
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the MaintenanceRequest model
export default model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
