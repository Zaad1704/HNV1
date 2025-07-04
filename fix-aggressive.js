#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function aggressiveFix(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Aggressive fixes for remaining syntax errors
    content = content
      // Fix class property initializers
      .replace(/(\w+)\s*:\s*([^=,}\n]+)\s*;/g, '$1 = $2;')
      .replace(/(\w+)\s*:\s*([^=,}\n]+)\s*,/g, '$1 = $2,')
      
      // Fix malformed object properties with colons instead of equals
      .replace(/(\w+)\s*:\s*([^,}\n]+)\s*,/g, '$1: $2,')
      .replace(/(\w+)\s*:\s*([^,}\n]+)\s*}/g, '$1: $2}')
      
      // Fix unterminated template literals
      .replace(/`([^`]*?)$/gm, '`$1`')
      .replace(/`([^`\n]*)\n([^`]*?)$/gm, '`$1\\n$2`')
      
      // Fix malformed function calls and object literals
      .replace(/\(\s*\{\s*([^}]+)\s*;\s*\}\s*\)/g, '({ $1 })')
      .replace(/\{\s*([^}]+)\s*;\s*\}/g, '{ $1 }')
      
      // Fix malformed try-catch blocks
      .replace(/try\s*\{\s*([^}]+)\s*\}\s*catch\s*\([^)]*\)\s*\{/g, 'try {\n$1\n} catch (error) {')
      .replace(/catch\s*\([^)]*\)\s*\{\s*([^}]+)\s*\}/g, 'catch (error) {\n$1\n}')
      
      // Fix export/import statements
      .replace(/export\s*\{\s*([^}]*)\s*\}\s*;?/g, 'export { $1 };')
      .replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]([^'"]*)['"]\s*;?/g, 'import { $1 } from \'$2\';')
      
      // Fix async function declarations
      .replace(/async\s*\(\s*([^)]*)\s*\)\s*:\s*Promise<([^>]*)>\s*=>/g, 'async ($1): Promise<$2> =>')
      .replace(/export const (\w+) = asyncHandler\(async \(([^)]*)\): Promise<void> => \{/g, 'export const $1 = asyncHandler(async ($2): Promise<void> => {')
      
      // Fix object method definitions
      .replace(/(\w+)\s*\(\s*([^)]*)\s*\)\s*\{/g, '$1($2) {')
      .replace(/async\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*\{/g, 'async $1($2) {')
      
      // Fix malformed conditionals
      .replace(/if\s*\([^)]+\)\s*\{\s*([^}]+)\s*\}\s*else\s*\{/g, 'if ($1) {\n$2\n} else {')
      .replace(/if\s*\([^)]+\)\s*\{\s*([^}]+)\s*\}/g, 'if ($1) {\n$2\n}')
      
      // Fix variable declarations
      .replace(/const\s*\{\s*([^}]+)\s*\}\s*=\s*([^;]+)\s*;?/g, 'const { $1 } = $2;')
      .replace(/const\s*\[\s*([^\]]+)\s*\]\s*=\s*([^;]+)\s*;?/g, 'const [$1] = $2;')
      
      // Fix arrow functions
      .replace(/=>\s*\{\s*([^{}]*[^;])\s*\}/g, (match, content) => {
        if (content.trim() && !content.includes('return') && !content.includes(';') && !content.includes('{')) {
          return `=> {\nreturn ${content.trim()};\n}`;
        }
        return match;
      })
      
      // Fix semicolon issues
      .replace(/([^;])\n(\s*[a-zA-Z_$])/g, '$1;\n$2')
      .replace(/;;+/g, ';')
      
      // Fix specific TypeScript syntax issues
      .replace(/:\s*Promise<void>\s*=>\s*\{/g, '): Promise<void> => {')
      .replace(/\)\s*:\s*Promise<([^>]*)>\s*=>/g, '): Promise<$1> =>')
      
      // Fix malformed comments
      .replace(/\/\*([^*]|\*[^/])*$/g, '/* $1 */')
      .replace(/\/\/.*\/$/gm, (match) => match.replace(/\/$/, ''))
      
      // Clean up whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/\s+$/gm, '')
      
      // Fix specific patterns causing compilation errors
      .replace(/\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^,}]+)\s*;\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '{ $1: $2, $3:')
      .replace(/\(\s*\{\s*([^}]+)\s*\}\s*\)\s*;/g, '({ $1 });')
      
      // Fix module declarations
      .replace(/module\.exports\s*=\s*\{([^}]*)\}/g, 'export default {\n$1\n}')
      .replace(/exports\.(\w+)\s*=\s*([^;]+);/g, 'export const $1 = $2;')
      
      // Fix remaining regex issues
      .replace(/\/([^\/\n]*?)$/gm, (match) => {
        if (!match.endsWith('/')) return match + '/';
        return match;
      });
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Aggressively fixed: ${filePath}`);
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
      if (aggressiveFix(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

// Start processing from backend directory
const backendDir = path.join(__dirname, 'backend');
if (fs.existsSync(backendDir)) {
  console.log('Applying aggressive fixes...');
  const fixedCount = processDirectory(backendDir);
  console.log(`Aggressively fixed ${fixedCount} files`);
} else {
  console.error('Backend directory not found');
}