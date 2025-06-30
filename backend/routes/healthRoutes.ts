import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'disconnected',
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  try {
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected';
    }
    res.status(200).json(health);
  } catch (error) {
    health.status = 'ERROR';
    res.status(503).json(health);
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

export default router;