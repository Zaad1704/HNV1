// backend/src/types/express.d.ts
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      name?: string;
      email: string;
      password?: string;
      role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
      status: 'active' | 'inactive' | 'suspended';
      permissions: string[];
      organizationId: Types.ObjectId;
      managedAgentIds: Types.ObjectId[];
      associatedLandlordIds: Types.ObjectId[];
      googleId?: string;
      passwordResetToken?: string;
      passwordResetExpires?: Date;
      token?: string; // This line is added
    }

    interface Request {
      user?: User;
      organizationId?: Types.ObjectId;
    }
  }
}

export {};
