import mongoose, { Schema, Document, model } from 'mongoose';

export interface IExportTemplate extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  type: 'properties' | 'tenants' | 'payments' | 'maintenance' | 'expenses';
  
  layout: {
    format: 'pdf' | 'csv';
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'A4' | 'Letter';
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  
  columns: Array<{
    field: string;
    label: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
    format?: 'text' | 'currency' | 'date' | 'number';
  }>;
  
  styling: {
    headerColor?: string;
    alternateRows?: boolean;
    showLogo?: boolean;
    showFooter?: boolean;
  };
  
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExportTemplateSchema: Schema<IExportTemplate> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['properties', 'tenants', 'payments', 'maintenance', 'expenses'], 
    required: true 
  },
  
  layout: {
    format: { type: String, enum: ['pdf', 'csv'], required: true },
    orientation: { type: String, enum: ['portrait', 'landscape'], default: 'portrait' },
    pageSize: { type: String, enum: ['A4', 'Letter'], default: 'A4' },
    margins: {
      top: { type: Number, default: 20 },
      right: { type: Number, default: 20 },
      bottom: { type: Number, default: 20 },
      left: { type: Number, default: 20 }
    }
  },
  
  columns: [{
    field: { type: String, required: true },
    label: { type: String, required: true },
    width: Number,
    align: { type: String, enum: ['left', 'center', 'right'], default: 'left' },
    format: { type: String, enum: ['text', 'currency', 'date', 'number'], default: 'text' }
  }],
  
  styling: {
    headerColor: { type: String, default: '#4F46E5' },
    alternateRows: { type: Boolean, default: true },
    showLogo: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true }
  },
  
  isDefault: { type: Boolean, default: false }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default model<IExportTemplate>('ExportTemplate', ExportTemplateSchema);