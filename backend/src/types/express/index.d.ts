// src/types/express/index.d.ts

import { IUser } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // Fully typed
      organizationId?: string;
    }
  }
}

export {}; // Needed to make this a module
