// backend/src/types/express/index.d.ts
import { IUser } from '../../models/User'; // Import your User interface

declare global {
  namespace Express {
    export interface Request {
      user?: IUser; // Attach your user type to the Request object
      organizationId?: string;
    }
  }
}
