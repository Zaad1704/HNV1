// --- FIXES ARE HERE ---
import User from '../models/userModel'; // <-- FIX: Import the User model
import OrgInvitation from '../models/OrgInvitation';
import Organization from '../models/Organization';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt'; // <-- FIX: Import the bcrypt library

// --- BEST PRACTICE ---
// Define the shape of the incoming request body for type safety and autocomplete.
interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  invitationToken?: string;
}

export async function register(req: Request<{}, {}, RegisterBody>, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role, invitationToken } = req.body;

    // It's good practice to validate that required fields exist
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // If invitationToken is present, validate and assign org/role from invitation
    let assignedOrgId = undefined;
    let assignedRole = role;

    if (invitationToken) {
      const invite = await OrgInvitation.findOne({ token: invitationToken, status: "pending", expiresAt: { $gt: new Date() } });
      if (!invite) {
        return res.status(400).json({ message: "Invalid or expired invitation token" });
      }
      assignedOrgId = invite.orgId;
      assignedRole = invite.role;
      invite.status = "accepted";
      await invite.save();
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      name,
      role: assignedRole,
      organizationId: assignedOrgId
    });

    res.status(201).json({ message: "User registered", user: { email, name, role: assignedRole, id: user._id } });
  } catch (err) {
    next(err);
  }
}

// You will also need to export other functions like 'login' if your routes use them
// export async function login(...) { ... }
