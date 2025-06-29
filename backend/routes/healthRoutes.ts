import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ 
        success: true, 
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});

export default router;