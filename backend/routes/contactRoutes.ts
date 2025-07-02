import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController';
import emailService from '../services/emailService';

const router = Router();

router.post('/submit', submitContactForm);

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    console.log('Testing email service...');
    
    await emailService.sendContactForm({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Email Service Test',
      message: 'This is a test message to verify email service is working.'
    });
    
    res.json({ success: true, message: 'Test email sent successfully!' });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({ success: false, message: 'Test email failed', error: error.message });
  }
});

export default router;