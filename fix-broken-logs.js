#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixBrokenSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove all the malformed regex patterns and fix basic syntax
    content = content
      // Remove trailing slashes that create regex literals
      .replace(/;\/$/gm, ';')
      .replace(/\}\/$/gm, '}')
      .replace(/\)\/$/gm, ')')
      .replace(/,\/$/gm, ',')
      .replace(/\/$/gm, '')
      
      // Fix malformed template literals
      .replace(/``/g, '`')
      .replace(/`([^`]*?)$/gm, '`$1`')
      
      // Fix malformed object properties
      .replace(/(\w+)\s*=\s*([^,}\n;]+)\s*,/g, '$1: $2,')
      .replace(/(\w+)\s*=\s*([^,}\n;]+)\s*}/g, '$1: $2}')
      .replace(/(\w+)\s*=\s*([^,}\n;]+)\s*;/g, '$1: $2;')
      
      // Fix malformed function parameters
      .replace(/\(\s*([^)]*)\s*=\s*([^)]*)\s*\)/g, '($1: $2)')
      
      // Fix malformed arrow functions
      .replace(/=>\s*\{\s*;\s*([^}]*)\s*\}/g, '=> {\n$1\n}')
      
      // Fix semicolon issues in objects
      .replace(/\{\s*;\s*([^}]*)\s*\}/g, '{\n$1\n}')
      
      // Fix malformed conditionals
      .replace(/if\s*\([^)]*\)\s*\{\s*;\s*([^}]*)\s*\}/g, 'if ($1) {\n$2\n}')
      
      // Clean up extra semicolons and malformed syntax
      .replace(/;\s*;/g, ';')
      .replace(/,\s*,/g, ',')
      .replace(/\n\s*;\s*$/gm, '')
      
      // Fix specific patterns
      .replace(/\$2/g, '')
      .replace(/\\n/g, '\n')
      
      // Fix malformed comments
      .replace(/\/\/.*\/$/gm, (match) => match.replace(/\/$/, ''))
      
      // Clean up whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\s+$/gm, '');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed broken syntax in: ${filePath}`);
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
      if (fixBrokenSyntax(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start processing from backend directory
const backendDir = path.join(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  console.log('Fixing broken syntax patterns...');
  const fixedCount = processDirectory(backendDir);
  console.log(`Fixed broken syntax in ${fixedCount} files`);
} else {
  console.error('Backend directory not found');
}