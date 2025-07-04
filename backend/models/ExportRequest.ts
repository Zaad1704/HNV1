import mongoose, { Schema, Document, model } from 'mongoose';
export interface IExportRequest extends Document { organizationId: mongoose.Types.ObjectId,;
  userId: mongoose.Types.ObjectId,;
  type: 'properties' | 'tenants' | 'payments' | 'maintenance' | 'expenses' | 'rent_collection' | 'collection_actions',;
  format: 'pdf' | 'csv' | 'excel'};
  filters: {
dateRange?: { start: Date,;
  end: Date
};
    properties?: mongoose.Types.ObjectId[];
    status?: string[];
    customFilters?: Record<string, any>;
  },;
  options: { includeImages?: boolean,;
    includeDocuments?: boolean;
    groupBy?: string;
    sortBy?: string;
    columns?: string[]
}
  },;
  status: 'pending' | 'processing' | 'completed' | 'failed',;
  progress: number,;
  result?: { fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    recordCount?: number;
    generatedAt?: Date;
    expiresAt?: Date
}
  };
  error?: { message?: string;
    details?: string
}
  },;
  createdAt: Date,;
  updatedAt: Date,;
const ExportRequestSchema: Schema<IExportRequest> = new Schema({
organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true
},;
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },;
  type: { type: String, ;
    enum: ['properties', 'tenants', 'payments', 'maintenance', 'expenses', 'rent_collection', 'collection_actions'], ;
    required: true}
  },;
  format: { type: String, enum: ['pdf', 'csv', 'excel'], required: true },;
  filters: { dateRange: {
start: Date,;
      end: Date
},;
    properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],;
    status: [String],;
    customFilters: Schema.Types.Mixed},;
  options: {
includeImages: { type: Boolean, default: false
},;
    includeDocuments: { type: Boolean, default: false },;
    groupBy: String,;
    sortBy: String,;
    columns: [String]},;
  status: { type: String, ;
    enum: ['pending', 'processing', 'completed', 'failed'], ;
    default: 'pending'  }
  },;
  progress: { type: Number, default: 0, min: 0, max: 100 },;
  result: { fileUrl: String,;
    fileName: String,;
    fileSize: Number,;
    recordCount: Number,;
    generatedAt: Date,;
    expiresAt: Date}
  },;
  error: { message: String,;
    details: String}, {
timestamps: true,;
  toJSON: { virtuals: true
},;
  toObject: { virtuals: true }
});
//  Auto-expire completed exports after 7 days;
ExportRequestSchema.index({ "result.expiresAt": 1 }, { expireAfterSeconds: 0 });
export default model<IExportRequest>('ExportRequest', ExportRequestSchema);