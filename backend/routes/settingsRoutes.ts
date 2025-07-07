import { Router } from 'express';
import { 
  getSettings, 
  updateSettings, 
  changePassword, 
  updateOrganization,
  uploadProfileImage,
  uploadOrganizationLogo
} from '../controllers/settingsController';
import {
  updateProfile,
  requestAccountDeletion,
  exportData
} from '../controllers/settingsController';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.put('/organization', updateOrganization);
router.post('/delete-account', requestAccountDeletion);
router.post('/export-data', exportData);
router.post('/upload-profile', upload.single('image'), uploadProfileImage);
router.post('/upload-org-logo', upload.single('logo'), uploadOrganizationLogo);

export default router;