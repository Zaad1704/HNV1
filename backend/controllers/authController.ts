import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => { /* ... */ };
export const login = async (req: Request, res: Response) => { /* ... */ };
export const getMe = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };
export const verifyInvite = async (req: Request, res: Response) => { /* ... */ };
export const acceptInvite = async (req: Request, res: Response) => { /* ... */ };
