import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController';
import emailService from '../services/emailService';

const router = Router();

router.post('/submit', submitContactForm);

// Email status endpoint
router.get('/email-status', async (req, res) => { try { }
    const configured = emailService.isConfigured();
    res.json({ success: true, 
      configured,
      message: configured ? 'Email service is configured' : 'Email service not configured' }

    });
  } catch (error) {
    res.json({ success: false, configured: false, message: 'Email service unavailable' });

});

// Test email endpoint
router.post('/test-email', async (req, res) => { try { }
    await emailService.sendContactForm({ name: 'Test User',
      email: 'test@example.com',
      subject: 'Email Service Test',
      message: 'This is a test message to verify email service is working.' }

    });
    
    res.json({ success: true, message: 'Test email sent successfully!' });
  } catch (error) { console.error('Test email failed:', error); }

    res.status(500).json({ success: false, message: 'Test email failed', error: error.message });

});

export default router;