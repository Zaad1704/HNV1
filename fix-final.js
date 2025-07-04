#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixFinalErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix the remaining specific syntax errors
    content = content
      // Fix malformed async function declarations
      .replace(/export const ([a-zA-Z_$][a-zA-Z0-9_$]*) = asyncHandler\(async \(([^)]*)\): Promise<void> => \{/g, 
               'export const $1 = asyncHandler(async ($2): Promise<void> => {')
      
      // Fix malformed object literals in responses
      .replace(/res\.json\(\{\s*([^}]+)\s*;\s*\}\s*\)/g, 'res.json({ $1 })')
      .replace(/res\.json\(\{\s*([^}]+)\s*\}\s*;\s*\)/g, 'res.json({ $1 })')
      
      // Fix malformed function parameters
      .replace(/\(([^)]*)\s*:\s*Promise<void>\s*=>\s*\{/g, '($1): Promise<void> => {')
      
      // Fix unterminated template literals
      .replace(/`([^`]*?)$/gm, '`$1`')
      .replace(/`([^`\n]*)\n([^`]*?)$/gm, '`$1\n$2`')
      
      // Fix malformed try-catch blocks
      .replace(/try\s*\{\s*([^}]+)\s*\}\s*catch\s*\([^)]*\)\s*\{/g, 'try {\n  $1\n} catch (error) {')
      
      // Fix malformed export statements
      .replace(/export\s*\{\s*([^}]*)\s*\}\s*;?\s*$/gm, 'export { $1 };')
      
      // Fix malformed import statements
      .replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]([^'"]*)['"]\s*;?/g, 'import { $1 } from \'$2\';')
      
      // Fix malformed object property assignments
      .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,}\n]+)\s*;/g, '$1: $2,')
      
      // Fix malformed arrow function returns
      .replace(/=>\s*\{\s*([^{}]*[^;])\s*\}/g, (match, content) => {
        if (content.trim() && !content.includes('return') && !content.includes(';') && !content.includes('{')) {
          return `=> {\n  return ${content.trim()};\n}`;
        }
        return match;
      })
      
      // Fix specific patterns that cause compilation errors
      .replace(/\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,}]+)\s*;\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '{ $1: $2, $3:')
      
      // Fix malformed conditional statements
      .replace(/if\s*\([^)]+\)\s*\{\s*([^}]+)\s*\}\s*\}/g, 'if ($1) { $2 }')
      
      // Fix malformed function calls
      .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\(\s*\{\s*([^}]+)\s*;\s*\}\s*\)/g, '$1({ $2 })')
      
      // Clean up extra whitespace and malformed syntax
      .replace(/\s+;/g, ';')
      .replace(/;;+/g, ';')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      
      // Fix specific TypeScript syntax issues
      .replace(/:\s*Promise<void>\s*=>\s*\{/g, '): Promise<void> => {')
      .replace(/async\s*\(\s*([^)]*)\s*\)\s*:\s*Promise<void>\s*=>/g, 'async ($1): Promise<void> =>')
      
      // Fix malformed object destructuring
      .replace(/const\s*\{\s*([^}]+)\s*\}\s*=\s*([^;]+)\s*;?\s*\}/g, 'const { $1 } = $2;')
      
      // Fix malformed array destructuring
      .replace(/const\s*\[\s*([^\]]+)\s*\]\s*=\s*([^;]+)\s*;?\s*\]/g, 'const [$1] = $2;');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed final errors in: ${filePath}`);
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
      if (fixFinalErrors(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start processing from backend directory
const backendDir = path.join(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  console.log('Applying final syntax fixes...');
  const fixedCount = processDirectory(backendDir);
  console.log(`Applied final fixes to ${fixedCount} files`);
} else {
  console.error('Backend directory not found');
}