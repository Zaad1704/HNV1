// backend/src/types/express.d.ts

import { Types, Document } from 'mongoose';
import { IUser } from '../../models/User';

// This uses module augmentation to add the 'user' property to the Express Request interface globally.
declare module 'express-serve-static-core' {
  interface Request {
    user?: (IUser & Document<any, any, any>) | null;
  }
}
