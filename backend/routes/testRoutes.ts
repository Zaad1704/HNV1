import { Router } from 'express';

const router = Router();

// Simple test routes to verify API is working
router.get('/ping', (req, res) => { res.json({ }
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl;

  });
});

router.get('/super-admin-test', (req, res) => { res.json({ }
    success: true, 
    message: 'Super admin routes accessible',
    timestamp: new Date().toISOString()

  });
});

export default router;