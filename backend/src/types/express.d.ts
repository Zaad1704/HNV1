// backend/src/types/express.d.ts
import { Types, Document } from 'mongoose';
import { IUser } from '../../models/User';

declare module 'express' {
  interface Request {
    // Define user as an IUser type combined with a Mongoose Document,
    // and allow it to be null/undefined.
    user?: (IUser & Document<any, any, any>) | null;
    organizationId?: Types.ObjectId;
  }
}

// This export statement is crucial to make this file a module,
// so 'declare module' works correctly.
export {};
