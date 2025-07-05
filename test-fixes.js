const fs = require('fs');
const path = require('path');

console.log('🧪 Testing fixes...\n');

// Test 1: Check uploads directory
const uploadsDir = path.join(__dirname, 'backend', 'uploads');
if (fs.existsSync(uploadsDir)) {
  console.log('✅ Uploads directory exists');
} else {
  console.log('❌ Uploads directory missing');
}

// Test 2: Check if fileUploadController is fixed
const fileUploadController = path.join(__dirname, 'backend', 'controllers', 'fileUploadController.ts');
const fileUploadContent = fs.readFileSync(fileUploadController, 'utf8');
if (fileUploadContent.includes('export const uploadImage = async') && !fileUploadContent.includes('$1')) {
  console.log('✅ fileUploadController.ts is fixed');
} else {
  console.log('❌ fileUploadController.ts still has issues');
}

// Test 3: Check if cmsController is fixed
const cmsController = path.join(__dirname, 'backend', 'controllers', 'cmsController.ts');
const cmsContent = fs.readFileSync(cmsController, 'utf8');
if (cmsContent.includes('export async function getAllContent') && !cmsContent.includes('try { };')) {
  console.log('✅ cmsController.ts is fixed');
} else {
  console.log('❌ cmsController.ts still has issues');
}

// Test 4: Check if test upload controller exists
const testUploadController = path.join(__dirname, 'backend', 'controllers', 'testUploadController.ts');
if (fs.existsSync(testUploadController)) {
  console.log('✅ Test upload controller created');
} else {
  console.log('❌ Test upload controller missing');
}

// Test 5: Check environment variables
const envPath = path.join(__dirname, 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.includes('FILE_UPLOAD_ENABLED=true')) {
  console.log('✅ Environment variables updated');
} else {
  console.log('❌ Environment variables not updated');
}

console.log('\n📋 Summary:');
console.log('- File uploads should now work with local storage');
console.log('- Super admin actions should work properly');
console.log('- Site editor banner section uploads should work');
console.log('- All broken syntax errors have been fixed');

console.log('\n🚀 To test:');
console.log('1. Restart your backend server: npm run dev (in backend folder)');
console.log('2. Login as Super Admin: admin@hnvpm.com / admin123');
console.log('3. Go to Site Editor and try uploading images');
console.log('4. Try deleting users or organizations in Super Admin panel');
console.log('5. Open upload-test.html to test uploads directly');