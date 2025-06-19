// src/types/express/index.d.ts

import { IUser } from '../../models/User'; // Adjust the import path to your User.ts file

declare global {
  namespace Express {
    export interface Request {
      // Attach the user property, typed as our Mongoose user interface
      user?: IUser;
    }
  }
}

// You must add a line to export something, even an empty object, to make this a module
export {};
