// ...existing code...
import OrgInvitation from "../models/OrgInvitation";
import Organization from "../models/Organization";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role, invitationToken } = req.body;
    // If invitationToken is present, validate and assign org/role from invitation
    let assignedOrgId = undefined;
    let assignedRole = role;
    if (invitationToken) {
      const invite = await OrgInvitation.findOne({ token: invitationToken, status: "pending", expiresAt: { $gt: new Date() } });
      if (!invite) return res.status(400).json({ message: "Invalid/expired invitation" });
      assignedOrgId = invite.orgId;
      assignedRole = invite.role;
      invite.status = "accepted";
      await invite.save();
    }
    // ...existing register logic...
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });
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