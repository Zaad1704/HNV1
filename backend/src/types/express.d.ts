import { Types, Document } from 'mongoose';
import { IUser } from '../../models/User';

declare module 'express' {
  interface Request {
    user?: (IUser & Document<any, any, any>) | null;
    organizationId?: Types.ObjectId;
  }
}

export {};
