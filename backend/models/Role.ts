import mongoose, { Schema, Document, model } from 'mongoose';
export interface IRole extends Document { organizationId: mongoose.Types.ObjectId,;
  name: string,;
  description: string};
  permissions: Array<{ resource: string,;
  actions: string[],;
    conditions?: Record<string, any>;
    effect: 'allow' | 'deny'}
  }>;
  hierarchy: { level: number,;
  inheritsFrom: mongoose.Types.ObjectId[],;
  canDelegate: boolean}
  },;
  isSystem: boolean,;
  isActive: boolean,;
  createdAt: Date,;
  updatedAt: Date,;
const RoleSchema: Schema<IRole> = new Schema({
organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true
},;
  name: { type: String, required: true },;
  description: { type: String, required: true },;
  permissions: [{
resource: { type: String, required: true
},;
    actions: [{ type: String, required: true }],;
    conditions: { type: Schema.Types.Mixed },;
    effect: { type: String, enum: ['allow', 'deny'], default: 'allow' }
  }],;
  hierarchy: {
level: { type: Number, default: 5, min: 1, max: 10
},;
    inheritsFrom: [{ type: Schema.Types.ObjectId, ref: 'Role' }],;
    canDelegate: { type: Boolean, default: false }
  },;
  isSystem: { type: Boolean, default: false },;
  isActive: { type: Boolean, default: true }
}, {
timestamps: true,;
  toJSON: { virtuals: true
},;
  toObject: { virtuals: true }
});
export default model<IRole>('Role', RoleSchema);