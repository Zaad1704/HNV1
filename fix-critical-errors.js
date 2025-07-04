const fs = require('fs');
const path = require('path');

function fixCriticalErrors(content, filePath) {
  // Fix unterminated template literals
  content = content.replace(/`[^`]*$/gm, (match) => {
    if (!match.includes('`')) return match + '`';
    return match;
  });
  
  // Fix missing closing braces for interfaces and classes
  content = content.replace(/(interface\s+\w+[^{]*{[^}]*)\n\s*$/gm, '$1\n}');
  content = content.replace(/(class\s+\w+[^{]*{[^}]*)\n\s*$/gm, '$1\n}');
  
  // Fix incomplete export statements
  content = content.replace(/export\s+default\s*$/gm, 'export default {};');
  
  // Fix incomplete function calls and object literals
  content = content.replace(/{\s*([^}]*[^,}])\s*$/gm, '{\n  $1\n}');
  
  // Fix missing semicolons after statements
  content = content.replace(/(\w+)\s*\n\s*}/g, '$1;\n}');
  
  // Fix malformed try-catch blocks
  content = content.replace(/try\s*{\s*([^}]*)\s*}\s*catch/g, 'try {\n  $1\n} catch');
  
  // Fix incomplete MongoDB schema definitions
  if (filePath.includes('models/')) {
    content = content.replace(/}, { timestamps: true }\);?\s*$/gm, '}, { timestamps: true });\n\nexport default model');
  }
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixCriticalErrors(content, filePath);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed);
      console.log(`Fixed critical errors in: ${filePath}`);
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
    
    if (stat.isDirectory() && !['node_modules', '.git', 'logs', 'dist'].includes(file)) {
      walkDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      processFile(filePath);
    }
  }
}

// Process backend directory
walkDirectory('./backend');
console.log('Critical error fixing complete');