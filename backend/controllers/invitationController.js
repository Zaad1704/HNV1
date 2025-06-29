"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendInvitation = exports.revokeInvitation = exports.getPendingInvitations = exports.acceptInvitation = exports.getInvitationDetails = exports.inviteUser = void 0;
const AgentInvitation_1 = __importDefault(require("../models/AgentInvitation"));
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = __importDefault(require("../services/emailService"));
const date_fns_1 = require("date-fns");
const inviteUser = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    const { email: recipientEmail, role } = req.body;
    const inviter = req.user;
    if (!recipientEmail || !role) {
        res.status(400).json({ success: false, message: 'Recipient email and role are required.' });
        return;
    }
    if (role !== 'Agent') {
        res.status(400).json({ success: false, message: 'Only "Agent" role can be invited this way.' });
        return;
    }
    try {
        const existingUser = await User_1.default.findOne({ email: recipientEmail });
        if (existingUser && existingUser.organizationId?.toString() === inviter.organizationId.toString()) {
            res.status(400).json({ success: false, message: 'User with this email is already a member of your organization.' });
            return;
        }
        const existingInvitation = await AgentInvitation_1.default.findOne({
            recipientEmail,
            organizationId: inviter.organizationId,
            status: 'pending'
        });
        if (existingInvitation) {
            res.status(400).json({ success: false, message: 'An invitation has already been sent to this email for your organization.' });
            return;
        }
        const newInvitation = await AgentInvitation_1.default.create({
            organizationId: inviter.organizationId,
            inviterId: inviter._id,
            recipientEmail,
            role: role,
            status: 'pending',
        });
        const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${newInvitation.token}`;
        await emailService_1.default.sendEmail(newInvitation.recipientEmail, `Invitation to join ${inviter.name}'s Team on HNV`, 'agentInvitation', { inviterName: inviter.name, acceptURL });
        res.status(200).json({ success: true, message: 'Invitation sent successfully.', data: newInvitation });
    }
    catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.inviteUser = inviteUser;
const getInvitationDetails = async (req, res) => {
    const { token } = req.params;
    try {
        const invitation = await AgentInvitation_1.default.findOne({ token });
        if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
            res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
            return;
        }
        const existingUser = await User_1.default.findOne({ email: invitation.recipientEmail });
        res.status(200).json({
            success: true,
            data: {
                email: invitation.recipientEmail,
                isExistingUser: !!existingUser,
                inviterName: (await User_1.default.findById(invitation.inviterId))?.name || 'Your Landlord'
            }
        });
    }
    catch (error) {
        console.error('Error fetching invitation details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getInvitationDetails = getInvitationDetails;
const acceptInvitation = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const invitation = await AgentInvitation_1.default.findOne({ token });
        if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
            res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
            return;
        }
        let user = await User_1.default.findOne({ email: invitation.recipientEmail });
        if (user) {
            if (user.organizationId && user.organizationId.toString() !== invitation.organizationId.toString()) {
                res.status(400).json({ success: false, message: 'This email is already associated with another organization.' });
                return;
            }
            user.organizationId = invitation.organizationId;
            user.role = invitation.role;
            await user.save();
        }
        else {
            if (!password) {
                res.status(400).json({ success: false, message: 'Password is required to create a new account.' });
                return;
            }
            user = await User_1.default.create({
                name: invitation.recipientEmail.split('@')[0],
                email: invitation.recipientEmail,
                password,
                role: invitation.role,
                organizationId: invitation.organizationId,
            });
        }
        invitation.status = 'accepted';
        await invitation.save();
        res.status(200).json({ success: true, message: 'Invitation accepted. Account created/updated.', token: user.getSignedJwtToken() });
    }
    catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.acceptInvitation = acceptInvitation;
const getPendingInvitations = async (req, res) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    const invitations = await AgentInvitation_1.default.find({
        organizationId: req.user.organizationId,
        status: 'pending'
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invitations });
};
exports.getPendingInvitations = getPendingInvitations;
const revokeInvitation = async (req, res) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    const { id } = req.params;
    const invitation = await AgentInvitation_1.default.findOne({ _id: id, organizationId: req.user.organizationId });
    if (!invitation) {
        res.status(404).json({ success: false, message: 'Invitation not found.' });
        return;
    }
    await invitation.deleteOne();
    res.status(200).json({ success: true, message: 'Invitation revoked successfully.' });
};
exports.revokeInvitation = revokeInvitation;
const resendInvitation = async (req, res) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    const { id } = req.params;
    const invitation = await AgentInvitation_1.default.findOne({ _id: id, organizationId: req.user.organizationId }).populate('inviterId', 'name');
    if (!invitation) {
        res.status(404).json({ success: false, message: 'Invitation not found.' });
        return;
    }
    if (invitation.status !== 'pending') {
        res.status(400).json({ success: false, message: 'This invitation cannot be resent.' });
        return;
    }
    invitation.expiresAt = (0, date_fns_1.addDays)(new Date(), 7);
    await invitation.save();
    const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${invitation.token}`;
    await emailService_1.default.sendEmail(invitation.recipientEmail, `Invitation to join ${invitation.inviterId?.name}'s Team`, 'agentInvitation', { inviterName: invitation.inviterId?.name, acceptURL });
    res.status(200).json({ success: true, message: 'Invitation resent successfully.' });
};
exports.resendInvitation = resendInvitation;
//# sourceMappingURL=invitationController.js.map