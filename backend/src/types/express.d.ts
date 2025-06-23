// backend/src/types/express.d.ts
import { Types } from 'mongoose';

// This declares an augmentation to the 'express' module.
// When 'express' is imported anywhere, its Request interface will now include 'user' and 'organizationId'.
declare module 'express' {
  interface Request {
    user?: {
      _id: Types.ObjectId;
      name?: string;
      email: string;
      password?: string;
      role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
      status: 'active' | 'inactive' | 'suspended';
      permissions: string[];
      organizationId?: Types.ObjectId;
      managedAgentIds?: Types.ObjectId[];
      associatedLandlordIds?: Types.ObjectId[];
      googleId?: string;
      passwordResetToken?: string;
      passwordResetExpires?: Date;
    };
    organizationId?: Types.ObjectId;
  }
}

// This export statement is crucial to make this file a module,
// so 'declare module' works correctly.
export {};
