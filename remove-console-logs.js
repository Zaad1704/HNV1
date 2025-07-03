const fs = require('fs');
const path = require('path');

const removeConsoleLogs = (dir) => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
      removeConsoleLogs(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalLength = content.length;
      
      // Remove console.log statements but keep console.error and console.warn
      content = content.replace(/^\s*console\.log\([^)]*\);\s*$/gm, '');
      content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
      
      // Clean up empty lines
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Cleaned: ${filePath}`);
      }
    }
  });
};

console.log('🧹 Removing excessive console.log statements...\n');
removeConsoleLogs('frontend/src');
removeConsoleLogs('backend');
console.log('\n✅ Console cleanup complete!');