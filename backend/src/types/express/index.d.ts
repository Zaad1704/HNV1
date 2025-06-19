import { Types } from 'mongoose';

// By declaring this in the global namespace, we are "module augmenting".
// We are adding our own properties to the existing Express.Request interface.
declare global {
  namespace Express {
    export interface Request {
      // Add the user property, making it optional since it's only present after the 'protect' middleware.
      user?: {
        _id: Types.ObjectId;
        name: string;
        email: string;
        role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
        organizationId: Types.ObjectId;
        managedAgentIds: Types.ObjectId[];
        // You can add other properties from IUser if you access them via req.user
      };
      // This property is added by the orgContext middleware
      organizationId?: string;
    }
  }
}
