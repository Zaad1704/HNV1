import { Router } from 'express';

const router = Router();

// Landing page stats
router.get('/landing-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProperties: 1250,
      totalTenants: 3400,
      totalUsers: 850,
      satisfactionRate: 98
    }
  });
});

// Public data endpoint
router.get('/public', (req, res) => {
  res.json({
    success: true,
    data: {
      appName: 'HNV Property Management',
      version: '1.0.0',
      features: ['Property Management', 'Tenant Portal', 'Payment Processing'],
      status: 'operational'
    }
  });
});

export default router;