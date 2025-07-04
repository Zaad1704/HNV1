const fs = require('fs');
const path = require('path');

function fixRemainingErrors(content, filePath) {
  // Fix unterminated template literals and broken syntax
  content = content.replace(/`[^`]*\$\{[^}]*$/gm, '');
  content = content.replace(/^\s*\}\s*\$\{[^}]*\}`\);\s*$/gm, '');
  content = content.replace(/^\s*\)\s*\$\{[^}]*\}`\);\s*$/gm, '');
  
  // Fix incomplete function calls
  content = content.replace(/(\w+)\(\s*$/gm, '$1();');
  
  // Fix missing closing braces for objects
  content = content.replace(/{\s*([^{}]*[^,}])\s*$/gm, '{ $1 }');
  
  // Fix incomplete export statements
  content = content.replace(/export\s*{\s*$/gm, 'export {};');
  content = content.replace(/export\s+default\s*$/gm, 'export default {};');
  
  // Fix malformed interface/class definitions
  content = content.replace(/(interface\s+\w+[^{]*{[^}]*)\n*$/gm, '$1\n}');
  content = content.replace(/(class\s+\w+[^{]*{[^}]*)\n*$/gm, '$1\n}');
  
  // Fix incomplete try-catch blocks
  content = content.replace(/try\s*{\s*([^}]*)\s*}\s*catch\s*$/gm, 'try {\n  $1\n} catch (error) {\n  console.error(error);\n}');
  
  // Fix missing semicolons
  content = content.replace(/(\w+)\n(\s*})/g, '$1;\n$2');
  
  // Fix MongoDB model exports
  if (filePath.includes('models/')) {
    if (!content.includes('export default model') && content.includes('Schema')) {
      content = content.replace(/}\);?\s*$/, '});\n\nexport default model');
    }
  }
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixRemainingErrors(content, filePath);
    
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed);
      console.log(`Fixed: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Error: ${filePath} - ${error.message}`);
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

walkDirectory('./backend');
console.log('Remaining error fixes complete');