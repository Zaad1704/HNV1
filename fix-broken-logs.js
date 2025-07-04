const fs = require('fs');
const path = require('path');

const fixBrokenLogs = (dir) => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
      fixBrokenLogs(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalLength = content.length;
      
      // Fix common broken patterns
      content = content.replace(/\s+`\);\s*$/gm, '');
      content = content.replace(/\s+\$\{[^}]*\}`\);\s*$/gm, '');
      content = content.replace(/^\s*\}\s*\$\{[^}]*\}`\);\s*$/gm, '');
      content = content.replace(/^\s*\)\s*\$\{[^}]*\}`\);\s*$/gm, '');
      
      // Fix unterminated template literals
      content = content.replace(/`[^`]*$/gm, '');
      
      // Remove orphaned closing brackets and parentheses
      content = content.replace(/^\s*\}\s*$/gm, '');
      content = content.replace(/^\s*\)\s*$/gm, '');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${filePath}`);
      }
    }
  });
};

console.log('🔧 Fixing broken template literals...\n');
fixBrokenLogs('backend');
console.log('\n✅ Template literal fixes complete!');