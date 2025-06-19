// src/types/express.d.ts
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      name: string;
      email: string;
      role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
      organizationId: Types.ObjectId;
      status: 'active' | 'inactive' | 'suspended';
      permissions: string[];
      managedAgentIds?: Types.ObjectId[];
      associatedLandlordIds?: Types.ObjectId[];
      googleId?: string;
    }

    interface Request {
      user?: User;
      organizationId?: Types.ObjectId;
    }
  }
}

export {}; // Important for module augmentation
