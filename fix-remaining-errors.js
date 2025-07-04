#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixSpecificErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix specific patterns from the error log
    content = content
      // Fix unterminated regular expressions
      .replace(/\/[^\/\n]*$/gm, (match) => {
        if (!match.endsWith('/')) return match + '/';
        return match;
      })
      // Fix unterminated template literals
      .replace(/`[^`]*$/gm, (match) => {
        if (!match.endsWith('`')) return match + '`';
        return match;
      })
      // Fix malformed catch/finally blocks
      .replace(/\}\s*catch\s*\([^)]*\)\s*\{/g, '} catch (error) {')
      .replace(/\}\s*finally\s*\{/g, '} finally {')
      // Fix missing try blocks
      .replace(/catch\s*\([^)]*\)\s*\{/g, (match, offset) => {
        const before = content.substring(0, offset);
        if (!before.includes('try {')) {
          return 'try {\n  // TODO: Add try block content\n} ' + match;
        }
        return match;
      })
      // Fix malformed object properties
      .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\?\s*\[\s*\d+\s*\]\s*\?\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '$1: $2?.[0]?.$3')
      // Fix reserved word usage
      .replace(/(\w+)\s*:\s*(true|false|null|undefined)\s*:/g, '$1: $2,')
      // Fix missing semicolons in statements
      .replace(/([a-zA-Z0-9_$\]})]\s*)\n(\s*[a-zA-Z_$])/g, '$1;\n$2')
      // Fix malformed export statements
      .replace(/export\s*\{\s*([^}]*)\s*\}\s*;?\s*$/gm, 'export { $1 };')
      // Fix malformed import statements
      .replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]([^'"]*)['"]\s*;?/g, 'import { $1 } from \'$2\';')
      // Fix arrow function syntax
      .replace(/=>\s*\{\s*([^}]*)\s*\}\s*([^;])/g, '=> {\n  $1\n}$2')
      // Fix missing return statements
      .replace(/\{\s*([^{}]*[^;])\s*\}/g, (match, content) => {
        if (content.trim() && !content.includes('return') && !content.includes(';')) {
          return `{\n  return ${content.trim()};\n}`;
        }
        return match;
      });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed specific errors in: ${filePath}`);
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
      if (fixSpecificErrors(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start processing from backend directory
const backendDir = path.join(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  console.log('Fixing remaining specific errors...');
  const fixedCount = processDirectory(backendDir);
  console.log(`Fixed specific errors in ${fixedCount} files`);
} else {
  console.error('Backend directory not found');
}