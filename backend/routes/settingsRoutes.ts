import { Router } from 'express';
import { getSettings, updateSettings, changePassword } from '../controllers/settingsController';

const router = Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/password', changePassword);

export default router;