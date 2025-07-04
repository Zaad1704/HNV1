#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common syntax error patterns and their fixes
const fixes = [
  // Fix malformed object literals with missing braces
  {
    pattern: /\{\s*\}\s*([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g,
    replacement: '{\n  $1'
  },
  // Fix semicolons instead of commas in object literals
  {
    pattern: /([a-zA-Z0-9_$'"}\]]+)\s*;\s*\}/g,
    replacement: '$1\n}'
  },
  // Fix missing closing braces in function calls
  {
    pattern: /\(\s*\{\s*([^}]+)\s*;\s*\}\s*\)/g,
    replacement: '({\n  $1\n})'
  },
  // Fix arrow functions with malformed bodies
  {
    pattern: /=>\s*\{\s*\}\s*([^;{}\n]+);/g,
    replacement: '=> {\n  $1;\n}'
  },
  // Fix try-catch blocks
  {
    pattern: /try\s*\{\s*\}\s*([^}]+)\s*\}\s*catch/g,
    replacement: 'try {\n  $1\n} catch'
  },
  // Fix catch blocks
  {
    pattern: /catch\s*\([^)]*\)\s*\{\s*([^}]+);\s*\}\s*\}/g,
    replacement: 'catch (error) {\n  $1;\n}'
  }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Apply all fixes
    fixes.forEach(fix => {
      content = content.replace(fix.pattern, fix.replacement);
    });
    
    // Additional specific fixes
    content = content
      // Fix malformed object literals
      .replace(/\{\s*\}\s*([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g, '{\n  $1')
      // Fix semicolons in object properties
      .replace(/([a-zA-Z0-9_$'"}\]]+)\s*;\s*([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g, '$1,\n  $2')
      // Fix trailing semicolons in objects
      .replace(/([a-zA-Z0-9_$'"}\]]+)\s*;\s*\}/g, '$1\n}')
      // Fix function calls with malformed objects
      .replace(/\(\s*\{\s*([^}]+)\s*;\s*\}\s*\)/g, '({\n  $1\n})')
      // Fix arrow functions
      .replace(/=>\s*\{\s*\}\s*([^;{}\n]+);/g, '=> {\n  $1;\n}')
      // Fix missing opening braces
      .replace(/=>\s*\{\s*([^}]+)\s*\}\s*([^;{}\n]+);/g, '=> {\n  $1\n  $2;\n}')
      // Fix malformed if statements
      .replace(/if\s*\([^)]+\)\s*\{\s*([^}]+);\s*\}\s*\}/g, 'if ($1) {\n  $2;\n}')
      // Fix malformed try blocks
      .replace(/try\s*\{\s*\}\s*([^}]+)\s*\}\s*catch/g, 'try {\n  $1\n} catch')
      // Fix export statements
      .replace(/export\s*\{\s*\}\s*([^;]+);/g, 'export {\n  $1\n};');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
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
      if (fixFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start processing from backend directory
const backendDir = path.join(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  console.log('Starting syntax error fixes...');
  const fixedCount = processDirectory(backendDir);
  console.log(`Fixed ${fixedCount} files`);
} else {
  console.error('Backend directory not found');
}