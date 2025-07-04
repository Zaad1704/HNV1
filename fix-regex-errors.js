#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixRegexErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix the malformed regex patterns created by previous script
    content = content
      // Remove trailing slashes that create unterminated regex literals
      .replace(/;\/$/gm, ';')
      .replace(/\}\/$/gm, '}')
      .replace(/\)\/$/gm, ')')
      .replace(/\/\/([^\/\n]*?)\/$/gm, '// $1')
      .replace(/import ([^;]+);\/$/gm, 'import $1;')
      .replace(/from ([^;]+);\/$/gm, 'from $1;')
      // Fix malformed comments
      .replace(/\/\/ ([^\/\n]*?)\/$/gm, '// $1')
      // Fix template literals with extra backticks
      .replace(/``/g, '`')
      // Fix malformed function calls
      .replace(/\(\s*\{\s*([^}]+)\s*\}\s*\)\s*;\/$/gm, '({ $1 });')
      // Fix malformed object literals
      .replace(/\{\s*([^}]+)\s*\}\s*\/$/gm, '{ $1 }')
      // Remove extra semicolons and slashes
      .replace(/;\s*;\s*\/$/gm, ';')
      .replace(/\n\s*;\s*$/gm, '')
      // Fix malformed arrow functions
      .replace(/=>\s*\{\s*([^}]+)\s*\}\s*\/$/gm, '=> { $1 }')
      // Fix malformed array literals
      .replace(/\[\s*([^\]]+)\s*\]\s*\/$/gm, '[$1]')
      // Clean up extra whitespace and malformed syntax
      .replace(/\s+\/$/gm, '')
      .replace(/\/\s*$/gm, '')
      // Fix specific patterns that cause regex errors
      .replace(/([a-zA-Z0-9_$'"}\]]+)\s*\/$/gm, '$1')
      .replace(/\)\s*\/$/gm, ')')
      .replace(/\}\s*\/$/gm, '}')
      .replace(/;\s*\/$/gm, ';')
      .replace(/,\s*\/$/gm, ',')
      // Fix malformed string literals
      .replace(/'([^']*)'\/$/gm, "'$1'")
      .replace(/"([^"]*)"\/$/gm, '"$1"')
      // Fix malformed function declarations
      .replace(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{[^}]*\}\s*\/$/gm, (match) => {
        return match.replace(/\/$/, '');
      });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed regex errors in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
      fixedCount += processDirectory(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.ts')) {
      if (fixRegexErrors(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start processing from backend directory
const backendDir = path.join(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  console.log('Fixing regex/slash errors...');
  const fixedCount = processDirectory(backendDir);
  console.log(`Fixed regex errors in ${fixedCount} files`);
} else {
  console.error('Backend directory not found');
}