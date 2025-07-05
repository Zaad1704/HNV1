#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing file upload and super admin issues...\n');

// 1. Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'backend', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory already exists');
}

// 2. Update environment variables to enable local file uploads
const envPath = path.join(__dirname, 'backend', '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Add file upload configuration
if (!envContent.includes('FILE_UPLOAD_ENABLED')) {
  envContent += '\n# File Upload Configuration\n';
  envContent += 'FILE_UPLOAD_ENABLED=true\n';
  envContent += 'UPLOAD_MAX_SIZE=5242880\n'; // 5MB
  envContent += 'UPLOAD_ALLOWED_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp\n';
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated environment variables for file uploads');
}

// 3. Create a simple upload test endpoint
const testUploadController = `
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
}

export const testUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const imageUrl = \`/uploads/\${req.file.filename}\`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed' 
    });
  }
};

export const getUploadedFiles = async (req: AuthRequest, res: Response) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(uploadsDir).map(filename => ({
      filename,
      url: \`/uploads/\${filename}\`,
      size: fs.statSync(path.join(uploadsDir, filename)).size
    }));

    res.json({ success: true, data: files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get files' 
    });
  }
};
`;

fs.writeFileSync(
  path.join(__dirname, 'backend', 'controllers', 'testUploadController.ts'),
  testUploadController
);
console.log('✅ Created test upload controller');

// 4. Update upload routes to include test endpoints
const uploadRoutesPath = path.join(__dirname, 'backend', 'routes', 'uploadRoutes.ts');
const uploadRoutesContent = `
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadImage, handleImageUpload } from '../controllers/uploadController';
import { testUpload, getUploadedFiles } from '../controllers/testUploadController';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

// Main upload routes
router.post('/image', upload.single('image'), handleImageUpload);
router.post('/file', upload.single('file'), handleImageUpload);

// Test upload routes
router.post('/test', upload.single('image'), testUpload);
router.get('/files', getUploadedFiles);

// Health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Upload service ready',
    timestamp: new Date().toISOString()
  });
});

export default router;
`;

fs.writeFileSync(uploadRoutesPath, uploadRoutesContent);
console.log('✅ Updated upload routes');

// 5. Create a super admin test script
const superAdminTestScript = `
#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isEmailVerified: Boolean,
  status: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function testSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create super admin
    let superAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      superAdmin = await User.create({
        name: 'Super Admin',
        email: 'admin@hnvpm.com',
        password: hashedPassword,
        role: 'Super Admin',
        isEmailVerified: true,
        status: 'active',
        createdAt: new Date()
      });
      console.log('✅ Created Super Admin user');
    } else {
      console.log('✅ Super Admin user exists');
    }

    console.log('Super Admin Details:');
    console.log('Email:', superAdmin.email);
    console.log('Role:', superAdmin.role);
    console.log('Status:', superAdmin.status);
    console.log('Verified:', superAdmin.isEmailVerified);

    await mongoose.disconnect();
    console.log('\\n✅ Super Admin test completed');
  } catch (error) {
    console.error('❌ Super Admin test failed:', error);
    process.exit(1);
  }
}

testSuperAdmin();
`;

fs.writeFileSync(path.join(__dirname, 'test-super-admin.js'), superAdminTestScript);
console.log('✅ Created super admin test script');

// 6. Create upload test HTML page
const uploadTestPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Upload Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .upload-area { border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0; }
        .result { margin: 20px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        input[type="file"] { margin: 10px 0; }
    </style>
</head>
<body>
    <h1>File Upload Test</h1>
    
    <div class="upload-area">
        <h3>Test File Upload</h3>
        <input type="file" id="fileInput" accept="image/*">
        <br>
        <button onclick="uploadFile()">Upload File</button>
    </div>
    
    <div id="result" class="result" style="display: none;"></div>
    
    <div>
        <h3>Uploaded Files</h3>
        <button onclick="loadFiles()">Load Files</button>
        <div id="filesList"></div>
    </div>

    <script>
        const API_BASE = window.location.hostname === 'localhost' 
            ? 'http://localhost:5001/api' 
            : 'https://hnv.onrender.com/api';

        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file');
                return;
            }
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(\`\${API_BASE}/upload/test\`, {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${token}\`
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                document.getElementById('result').style.display = 'block';
                document.getElementById('result').innerHTML = \`
                    <h4>Upload Result:</h4>
                    <pre>\${JSON.stringify(result, null, 2)}</pre>
                \`;
                
                if (result.success) {
                    loadFiles();
                }
            } catch (error) {
                document.getElementById('result').style.display = 'block';
                document.getElementById('result').innerHTML = \`
                    <h4>Upload Error:</h4>
                    <pre>\${error.message}</pre>
                \`;
            }
        }
        
        async function loadFiles() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(\`\${API_BASE}/upload/files\`, {
                    headers: {
                        'Authorization': \`Bearer \${token}\`
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const filesList = document.getElementById('filesList');
                    filesList.innerHTML = result.data.map(file => \`
                        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                            <strong>\${file.filename}</strong><br>
                            <small>Size: \${(file.size / 1024).toFixed(2)} KB</small><br>
                            <a href="\${API_BASE.replace('/api', '')}\${file.url}" target="_blank">View File</a>
                        </div>
                    \`).join('');
                } else {
                    document.getElementById('filesList').innerHTML = '<p>No files found</p>';
                }
            } catch (error) {
                document.getElementById('filesList').innerHTML = \`<p>Error loading files: \${error.message}</p>\`;
            }
        }
        
        // Load files on page load
        loadFiles();
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'upload-test.html'), uploadTestPage);
console.log('✅ Created upload test page');

console.log('\n🎉 All fixes applied successfully!\n');
console.log('Next steps:');
console.log('1. Run: node test-super-admin.js');
console.log('2. Restart your backend server');
console.log('3. Open upload-test.html in your browser to test uploads');
console.log('4. Login as Super Admin (admin@hnvpm.com / admin123)');
console.log('5. Test file uploads in the site editor');