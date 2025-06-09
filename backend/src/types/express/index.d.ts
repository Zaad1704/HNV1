// backend/src/types/express/index.d.ts

declare namespace Express {
  export interface Request {
    user?: any; // Or a more specific type if you have one, e.g., UserPayload
    organizationId?: string;
  }
}