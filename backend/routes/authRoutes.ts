// backend/routes/authRoutes.ts

import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    getMe 
} from '../controllers/authController';
import { protect } from "../middleware/authMiddleware"; // Import the 'protect' middleware
import { validate } from "../middleware/validateMiddleware";
import { registerSchema } from "../validators/userValidator";

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', loginUser);

// Protected route - This was missing
router.get('/me', protect, getMe);

export default router;
