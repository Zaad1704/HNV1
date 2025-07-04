const fs = require('fs');
const path = require('path');

function fixCommonSyntaxErrors(content) {
  // Fix unterminated template literals
  content = content.replace(/`[^`]*$/gm, (match) => match + '`');
  
  // Fix missing closing braces for try-catch blocks
  content = content.replace(/(\s+try\s*{[^}]*)\n(\s*}\s*catch)/g, '$1\n  }\n$2');
  
  // Fix missing closing braces for if statements
  content = content.replace(/(\s+if\s*\([^)]*\)\s*{[^}]*)\n(\s+[^}])/g, '$1\n  }\n$2');
  
  // Fix missing semicolons at end of statements
  content = content.replace(/(\w+)\n(\s*})/g, '$1;\n$2');
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCommonSyntaxErrors(content);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed);
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'logs'].includes(file)) {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      processFile(filePath);
    }
  }
}

// Process backend directory
walkDirectory('./backend');
console.log('Syntax fixing complete');