import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  const health = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      cpu: process.cpuUsage()
    }
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      health.services.database = 'connected';
    } else {
      health.services.database = 'disconnected';
      health.success = false;
    }
  } catch (error) {
    health.services.database = 'error';
    health.success = false;
  }

  const statusCode = health.success ? 200 : 503;
  res.status(statusCode).json(health);
});

// Database health check
router.get('/db', async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (dbState === 1) {
      // Test database operation
      await mongoose.connection.db.admin().ping();
      res.status(200).json({
        success: true,
        database: {
          status: states[dbState as keyof typeof states],
          host: mongoose.connection.host,
          name: mongoose.connection.name
        }
      });
    } else {
      res.status(503).json({
        success: false,
        database: {
          status: states[dbState as keyof typeof states]
        }
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      database: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;