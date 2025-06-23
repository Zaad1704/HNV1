// backend/src/types/express.d.ts
import { Types, Document } from 'mongoose';
import { IUser } from '../../models/User';

declare module 'express' {
  interface Request {
    // Defines that req.user will be an IUser document or null/undefined
    user?: (IUser & Document<any, any, any>) | null;
    // Keep organizationId as it's a custom property added by middleware
    organizationId?: Types.ObjectId; 
  }
}

// This export statement is crucial to make this file a module,
// so 'declare module' works correctly.
export {};
