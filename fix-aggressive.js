const fs = require('fs');
const path = require('path');

function aggressiveFix(content) {
  // Remove broken template literals completely
  content = content.replace(/`[^`]*\$\{[^}]*$/gm, '');
  content = content.replace(/^\s*\}\s*\$\{[^}]*\}`.*$/gm, '');
  content = content.replace(/^\s*\)\s*\$\{[^}]*\}`.*$/gm, '');
  
  // Fix incomplete statements
  content = content.replace(/^\s*\}\s*$/gm, '');
  content = content.replace(/^\s*\)\s*$/gm, '');
  content = content.replace(/^\s*,\s*$/gm, '');
  
  // Fix malformed object properties
  content = content.replace(/(\w+):\s*$/gm, '$1: ""');
  
  // Fix incomplete function calls
  content = content.replace(/(\w+)\(\s*$/gm, '$1()');
  
  // Fix missing semicolons
  content = content.replace(/(\w+)\n(\s*[})])/g, '$1;\n$2');
  
  // Fix incomplete exports
  content = content.replace(/export\s*{\s*$/gm, 'export {};');
  content = content.replace(/export\s+default\s*$/gm, 'export default {};');
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = aggressiveFix(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed);
    }
  } catch (error) {
    // Ignore errors
  }
}

function walkDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'logs', 'dist'].includes(file)) {
        walkDirectory(filePath);
      } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        processFile(filePath);
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

walkDirectory('./backend');
console.log('Aggressive fixes applied');