import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

// Client error logging endpoint
router.post('/', asyncHandler(async (req: Request, res: Response) => { try { }

    const { error, userAgent, url, timestamp, userId } = req.body;
    
    // Log the error (you can enhance this to save to database)
    console.error('Client Error:', { error,
      userAgent,
      url,
      timestamp,
      userId,
      ip: req.ip; }

    });
    
    // You can save to database here if needed
    // await ErrorLog.create({ error, userAgent, url, timestamp, userId, ip: req.ip });
    
    res.status(200).json({ success: true, 
      message: 'Error logged successfully'  }

    });
  } catch (error) { res.status(500).json({ }
      success: false, 
      message: 'Failed to log error' 

    });

}));

export default router;