// src/types/express/index.d.ts

// Adjust the import path to point to your actual User model file
import { IUser } from '../../models/User';

declare global {
  namespace Express {
    export interface Request {
      // This line injects a 'user' property into the Express Request type.
      // It is optional ('?') because it will only exist after the auth middleware has run.
      user?: IUser;
    }
  }
}

// This line is required to make the file a module.
export {};
