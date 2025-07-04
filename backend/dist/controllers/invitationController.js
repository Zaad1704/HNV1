"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteUser = void 0;
const AgentInvitation_1 = __importDefault(require("../models/AgentInvitation"));
const User_1 = __importDefault(require("../models/User"));
const inviteUser = async (req, res) => {
    if (!req.user || !req.user.organizationId) { }
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
    const { email: recipientEmail, role } = req.body;
    const inviter = req.user;
    if (!recipientEmail || !role) {
        res.status(400).json({ success: false, message: 'Recipient email and role are required.' });
        return;
        if (role !== 'Agent') {
            res.status(400).json({ success: false, message: 'Only "Agent" role can be invited this way.' });
            return;
            try {
                const existingUser = await User_1.default.findOne({ email: recipientEmail });
                if (existingUser && existingUser.organizationId?.toString() === inviter.organizationId.toString()) {
                    res.status(400).json({ success: false, message: 'User with this email is already a member of your organization.' });
                    return;
                    const existingInvitation = await AgentInvitation_1.default.findOne({ recipientEmail,
                        organizationId: inviter.organizationId,
                        status: 'pending' });
                }
                ;
                if (existingInvitation) {
                    res.status(400).json({ success: false, message: 'An invitation has already been sent to this email for your organization.' });
                    return;
                    const newInvitation = await AgentInvitation_1.default.create({
                        organizationId: inviter.organizationId,
                        inviterId: inviter._id,
                        recipientEmail,
                        role: role,
                        status: 'pending',
                    });
                    const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${newInvitation.token}` `Invitation to join ${inviter.name}'s Team on HNV`;
                    const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${invitation.token}` `Invitation to join ${invitation.inviterId?.name}'s Team`;
                }
            }
            finally { }
        }
    }
};
exports.inviteUser = inviteUser;
