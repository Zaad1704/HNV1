import { Router } from 'express';
// Using try-catch instead of asyncHandler
import emailService from '../services/emailService';

const router = Router();

// Invite agent
router.post('/agent', async (req, res) => {
  const { email, name, role = 'agent' } = req.body;
  
  try {
    await emailService.sendEmail(
      email,
      'Invitation to Join HNV Property Management',
      'agent-invite',
      {
        name: name || 'Agent',
        inviterName: req.user?.name || 'Property Manager',
        inviteUrl: `${process.env.FRONTEND_URL}/register?invite=agent&email=${email}`,
        role: 'Agent'
      }
    );
    
    res.json({
      success: true,
      message: 'Agent invitation sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
});

// Invite tenant
router.post('/tenant', async (req, res) => {
  const { email, name, propertyName } = req.body;
  
  try {
    await emailService.sendEmail(
      email,
      'Invitation to Join Property Portal',
      'tenant-invite',
      {
        name: name || 'Tenant',
        landlordName: req.user?.name || 'Property Manager',
        propertyName: propertyName || 'Your Property',
        inviteUrl: `${process.env.FRONTEND_URL}/register?invite=tenant&email=${email}`
      }
    );
    
    res.json({
      success: true,
      message: 'Tenant invitation sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
});

export default router;