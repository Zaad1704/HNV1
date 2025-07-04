import mongoose, { Schema, Document, model, Types } from 'mongoose';
import { IProperty } from './Property';
import { IOrganization } from './Organization';

// Expanded sub-document interface for other adults
interface IAdditionalAdult {
    name: string;
    phone?: string;
    fatherName?: string;
    motherName?: string;
    permanentAddress?: string;
    govtIdNumber?: string;
    govtIdImageUrl?: string;
    imageUrl?: string;

// Expanded sub-document interface for references
interface IReference {
    name: string;
    phone?: string;
    email?: string;
    idNumber?: string; // New field

export interface ITenant extends Document {
    name: string;
    email: string;
    phone?: string;
    
    propertyId: Types.ObjectId | IProperty;
    organizationId: Types.ObjectId | IOrganization;

    unit: string;
    status: 'Active' | 'Inactive' | 'Late';
    leaseEndDate?: Date;
    rentAmount?: number;
    rentDueDay?: number; // Day of month rent is due
    unitNumber?: string; // Alternative to unit
    preferredContactMethod?: 'phone' | 'email' | 'sms';
    stripeCustomerId?: string;
    
    // --- NEW FIELDS FOR PRIMARY TENANT ---
    imageUrl?: string; // Tenant's own photo
    govtIdNumber?: string;
    govtIdImageUrlFront?: string;
    govtIdImageUrlBack?: string;
    fatherName?: string;
    motherName?: string;
    permanentAddress?: string;
    
    reference?: IReference;
    additionalAdults?: IAdditionalAdult[];
    
    // ... existing fields
    createdAt: Date;
    discountAmount?: number;
    discountExpiresAt?: Date;

const TenantSchema: Schema<ITenant> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    unit: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'Late'], default: 'Active' },
    leaseEndDate: { type: Date },
    rentAmount: { type: Number, default: 0 },
    rentDueDay: { type: Number, default: 1, min: 1, max: 31 },
    unitNumber: { type: String },
    preferredContactMethod: { type: String, enum: ['phone', 'email', 'sms'], default: 'phone' },
    stripeCustomerId: { type: String },
    
    // --- ADDING NEW FIELDS TO THE SCHEMA ---
    imageUrl: { type: String },
    govtIdNumber: { type: String },
    govtIdImageUrlFront: { type: String },
    govtIdImageUrlBack: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    permanentAddress: { type: String },

    reference: {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        idNumber: { type: String },
    },
    additionalAdults: [{
        name: { type: String },
        phone: { type: String },
        fatherName: { type: String },
        motherName: { type: String },
        permanentAddress: { type: String },
        govtIdNumber: { type: String },
        govtIdImageUrl: { type: String },
        imageUrl: { type: String },
    }],
    discountAmount: { type: Number, default: 0 },
    discountExpiresAt: { type: Date },
}, { timestamps: true });

export default model<ITenant>('Tenant', TenantSchema);
