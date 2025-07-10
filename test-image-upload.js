const fs = require('fs');
const path = require('path');

// Test image upload functionality
console.log('Testing image upload functionality...');

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'backend', 'uploads');
console.log('Uploads directory:', uploadsDir);
console.log('Uploads directory exists:', fs.existsSync(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created');
}

// Check if images subdirectory exists
const imagesDir = path.join(uploadsDir, 'images');
console.log('Images directory:', imagesDir);
console.log('Images directory exists:', fs.existsSync(imagesDir));

if (!fs.existsSync(imagesDir)) {
  console.log('Creating images directory...');
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('Images directory created');
}

// List existing files in uploads
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  console.log('Files in uploads directory:', files);
}

console.log('Image upload test completed');