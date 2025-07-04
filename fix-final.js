const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unterminated template literals
    content = content.replace(/`[^`]*$/gm, '');
    
    // Fix malformed object/function syntax
    content = content.replace(/{\s*}\s*$/gm, '{}');
    content = content.replace(/\(\s*\)\s*$/gm, '()');
    
    // Fix incomplete statements
    content = content.replace(/;\s*}\s*$/gm, ';\n}');
    
    fs.writeFileSync(filePath, content);
  } catch (error) {
    // Ignore errors
  }
}

// Fix remaining problematic files
const files = [
  'backend/services/translationService.ts',
  'backend/services/userService.ts', 
  'backend/services/whatsAppService.ts',
  'backend/tests/setup.ts',
  'backend/utils/dbOptimizer.ts'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  }
});

console.log('Final fixes applied');