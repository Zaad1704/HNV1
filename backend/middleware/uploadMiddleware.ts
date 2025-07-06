import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { Request } from 'express';
import { s3, S3_CONFIG } from '../config/aws';

// File filter for security
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'));
  }
};

// Helper function to organize files in S3 folders
function getUploadFolder(fieldname: string): string {
  switch (fieldname) {
    case 'logo':
    case 'image':
      return 'site-assets';
    case 'profile':
    case 'avatar':
      return 'profiles';
    case 'property':
      return 'properties';
    case 'document':
      return 'documents';
    default:
      return 'uploads';
  }
}

// S3 Upload Configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_CONFIG.bucket,
    acl: 'public-read',
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const folder = getUploadFolder(file.fieldname);
      const filename = `${folder}/${file.fieldname}-${uniqueSuffix}${extension}`;
      cb(null, filename);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: (req as any).user?.id || 'anonymous',
        uploadedAt: new Date().toISOString()
      });
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

export default upload;