import { Router } from 'express';
import mongoose from 'mongoose';
import { cacheService } from '../services/cacheService';

// Import redis check
let redis: any = null;
try {
  const Redis = require('redis');
  redis = Redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
} catch (error) {
  // Redis not available
}

const router = Router();

router.get('/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Test cache connection
    let cacheStatus = 'disabled';
    try {
      if (redis) {
        await cacheService.set('health-check', 'ok', 10);
        const cacheTest = await cacheService.get('health-check');
        cacheStatus = cacheTest === 'ok' ? 'connected' : 'error';
      }
    } catch (error) {
      cacheStatus = 'error';
    }
    
    const health = {
      status: dbStatus === 'connected' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services: {
        database: dbStatus,
        cache: cacheStatus,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        uptime: Math.round(process.uptime())
      },
      version: process.env.npm_package_version || '1.0.0'
    };
    
    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const dbReady = mongoose.connection.readyState === 1;
    
    if (dbReady) {
      res.status(200).json({ status: 'READY' });
    } else {
      res.status(503).json({ status: 'NOT_READY' });
    }
  } catch (error) {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

export default router;