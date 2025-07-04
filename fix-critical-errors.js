#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixCriticalErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix the most critical syntax errors that prevent compilation
    content = content
      // Fix malformed object literals - most common error
      .replace(/\{\s*\}\s*([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g, '{\n  $1')
      // Fix semicolons instead of commas in objects
      .replace(/([a-zA-Z0-9_$'"}\]]+)\s*;\s*([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/g, '$1,\n  $2')
      // Fix trailing semicolons in objects
      .replace(/([a-zA-Z0-9_$'"}\]]+)\s*;\s*\}/g, '$1\n}')
      // Fix malformed function calls
      .replace(/\(\s*\{\s*([^}]+)\s*;\s*\}\s*\)/g, '({\n  $1\n})')
      // Fix arrow functions with malformed bodies
      .replace(/=>\s*\{\s*\}\s*([^;{}\n]+);/g, '=> {\n  $1;\n}')
      // Fix missing opening braces in functions
      .replace(/=>\s*\{\s*([^}]+)\s*\}\s*([^;{}\n]+);/g, '=> {\n  $1\n  $2;\n}')
      // Fix try-catch blocks
      .replace(/try\s*\{\s*\}\s*([^}]+)\s*\}\s*catch/g, 'try {\n  $1\n} catch')
      // Fix catch blocks without proper syntax
      .replace(/catch\s*\([^)]*\)\s*\{\s*([^}]+);\s*\}\s*\}/g, 'catch (error) {\n  $1;\n}')
      // Fix malformed if statements
      .replace(/if\s*\([^)]+\)\s*\{\s*([^}]+);\s*\}\s*\}/g, 'if ($1) {\n  $2;\n}')
      // Fix export statements
      .replace(/export\s*\{\s*\}\s*([^;]+);/g, 'export {\n  $1\n};')
      // Fix import statements
      .replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]([^'"]*)['"]\s*;?/g, 'import { $1 } from \'$2\';')
      // Fix unterminated template literals
      .replace(/`[^`\n]*$/gm, (match) => match + '`')
      // Fix unterminated regular expressions
      .replace(/\/[^\/\n]*$/gm, (match) => {
        if (!match.endsWith('/')) return match + '/';
        return match;
      })
      // Fix reserved word usage as property names
      .replace(/(\w+)\s*:\s*(true|false|null|undefined)\s*:/g, '$1: $2,')
      // Fix missing semicolons
      .replace(/([a-zA-Z0-9_$\]})]\s*)\n(\s*[a-zA-Z_$])/g, '$1;\n$2')
      // Fix malformed async function declarations
      .replace(/async\s*\([^)]*\)\s*=>\s*\{/g, 'async ($1) => {')
      // Fix missing return statements in arrow functions
      .replace(/=>\s*\{\s*([^{}]*[^;])\s*\}/g, (match, content) => {
        if (content.trim() && !content.includes('return') && !content.includes(';') && !content.includes('{')) {
          return `=> {\n  return ${content.trim()};\n}`;
        }
        return match;
      });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed critical errors in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// List of most critical files that need fixing first
const criticalFiles = [
  'app.ts',
  'server.ts',
  'config/index.ts',
  'config/passport-setup.ts',
  'controllers/authController.ts',
  'controllers/dashboardController.ts',
  'middleware/authMiddleware.ts',
  'middleware/errorHandler.ts',
  'models/User.ts',
  'models/Organization.ts',
  'services/masterDataService.ts'
];

function processCriticalFiles() {
  const backendDir = path.join(__dirname, 'backend');
  let fixedCount = 0;
  
  for (const file of criticalFiles) {
    const fullPath = path.join(backendDir, file);
    if (fs.existsSync(fullPath)) {
      if (fixCriticalErrors(fullPath)) {
        fixedCount++;
      }
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  }
  
  return fixedCount;
}

function processAllFiles(dir) {
  const items = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
      fixedCount += processAllFiles(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.ts')) {
      if (fixCriticalErrors(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start with critical files first
console.log('Fixing critical files first...');
let fixedCount = processCriticalFiles();
console.log(`Fixed ${fixedCount} critical files`);

// Then process all remaining files
console.log('Processing all remaining files...');
const backendDir = path.join(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  const remainingFixed = processAllFiles(backendDir);
  console.log(`Fixed ${remainingFixed} additional files`);
  console.log(`Total files fixed: ${fixedCount + remainingFixed}`);
} else {
  console.error('Backend directory not found');
}