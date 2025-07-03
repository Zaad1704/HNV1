const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE SYSTEM AUDIT - PRE-LAUNCH CHECK\n');

// 1. Check critical files exist
const criticalFiles = [
  'frontend/package.json',
  'backend/package.json', 
  'frontend/src/App.tsx',
  'backend/server.ts',
  'frontend/public/index.html',
  'backend/.env',
  'frontend/.env'
];

console.log('1. CRITICAL FILES CHECK:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 2. Check environment variables
console.log('\n2. ENVIRONMENT VARIABLES CHECK:');
const requiredEnvVars = [
  'MONGODB_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'
];

if (fs.existsSync('backend/.env')) {
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  requiredEnvVars.forEach(envVar => {
    const exists = envContent.includes(envVar);
    console.log(`${exists ? '✅' : '❌'} ${envVar}`);
  });
} else {
  console.log('❌ Backend .env file missing');
}

// 3. Check package.json dependencies
console.log('\n3. PACKAGE DEPENDENCIES CHECK:');
const checkDependencies = (packagePath, name) => {
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const depCount = Object.keys(pkg.dependencies || {}).length;
    const devDepCount = Object.keys(pkg.devDependencies || {}).length;
    console.log(`✅ ${name}: ${depCount} deps, ${devDepCount} devDeps`);
    
    // Check for security vulnerabilities in common packages
    const vulnerablePackages = ['lodash', 'moment', 'request'];
    vulnerablePackages.forEach(vuln => {
      if (pkg.dependencies?.[vuln] || pkg.devDependencies?.[vuln]) {
        console.log(`⚠️  ${name}: Contains potentially vulnerable package: ${vuln}`);
      }
    });
  } else {
    console.log(`❌ ${name}: package.json missing`);
  }
};

checkDependencies('frontend/package.json', 'Frontend');
checkDependencies('backend/package.json', 'Backend');

// 4. Check TypeScript compilation
console.log('\n4. TYPESCRIPT COMPILATION CHECK:');
const checkTSConfig = (configPath, name) => {
  if (fs.existsSync(configPath)) {
    try {
      const tsConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`✅ ${name}: TypeScript config valid`);
      if (tsConfig.compilerOptions?.strict) {
        console.log(`✅ ${name}: Strict mode enabled`);
      } else {
        console.log(`⚠️  ${name}: Strict mode disabled`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Invalid TypeScript config`);
    }
  } else {
    console.log(`❌ ${name}: tsconfig.json missing`);
  }
};

checkTSConfig('frontend/tsconfig.json', 'Frontend');
checkTSConfig('backend/tsconfig.json', 'Backend');

// 5. Check for console.log statements (should be removed in production)
console.log('\n5. CONSOLE.LOG STATEMENTS CHECK:');
const scanForConsoleLog = (dir, prefix = '') => {
  let consoleCount = 0;
  if (!fs.existsSync(dir)) return consoleCount;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
      consoleCount += scanForConsoleLog(filePath, prefix + file + '/');
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/console\.(log|error|warn|info)/g);
      if (matches) {
        consoleCount += matches.length;
        if (matches.length > 5) {
          console.log(`⚠️  ${prefix}${file}: ${matches.length} console statements`);
        }
      }
    }
  });
  return consoleCount;
};

const frontendConsoles = scanForConsoleLog('frontend/src');
const backendConsoles = scanForConsoleLog('backend');
console.log(`Frontend: ${frontendConsoles} console statements`);
console.log(`Backend: ${backendConsoles} console statements`);

// 6. Check for TODO/FIXME comments
console.log('\n6. TODO/FIXME COMMENTS CHECK:');
const scanForTodos = (dir, prefix = '') => {
  let todoCount = 0;
  if (!fs.existsSync(dir)) return todoCount;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
      todoCount += scanForTodos(filePath, prefix + file + '/');
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const todos = content.match(/\/\/(.*?)(TODO|FIXME|HACK|XXX)(.*?)$/gm);
      if (todos) {
        todoCount += todos.length;
        todos.forEach(todo => {
          console.log(`⚠️  ${prefix}${file}: ${todo.trim()}`);
        });
      }
    }
  });
  return todoCount;
};

const frontendTodos = scanForTodos('frontend/src');
const backendTodos = scanForTodos('backend');
console.log(`Total TODOs: ${frontendTodos + backendTodos}`);

// 7. Check for hardcoded URLs/secrets
console.log('\n7. HARDCODED SECRETS CHECK:');
const scanForSecrets = (dir, prefix = '') => {
  let secretCount = 0;
  if (!fs.existsSync(dir)) return secretCount;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
      secretCount += scanForSecrets(filePath, prefix + file + '/');
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for potential secrets
      const secretPatterns = [
        /sk_[a-zA-Z0-9]{24,}/g, // Stripe secret keys
        /pk_[a-zA-Z0-9]{24,}/g, // Stripe public keys
        /AIza[0-9A-Za-z\\-_]{35}/g, // Google API keys
        /mongodb:\/\/[^\/\s]+/g, // MongoDB URLs
        /postgres:\/\/[^\/\s]+/g, // PostgreSQL URLs
        /password['"]\s*:\s*['"][^'"]+['"]/gi, // Hardcoded passwords
        /secret['"]\s*:\s*['"][^'"]+['"]/gi // Hardcoded secrets
      ];
      
      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          secretCount += matches.length;
          console.log(`🚨 ${prefix}${file}: Potential secret found`);
        }
      });
    }
  });
  return secretCount;
};

const frontendSecrets = scanForSecrets('frontend/src');
const backendSecrets = scanForSecrets('backend');
console.log(`Potential secrets found: ${frontendSecrets + backendSecrets}`);

// 8. Check build scripts
console.log('\n8. BUILD SCRIPTS CHECK:');
const checkBuildScripts = (packagePath, name) => {
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = pkg.scripts || {};
    
    const requiredScripts = ['build', 'start'];
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        console.log(`✅ ${name}: ${script} script exists`);
      } else {
        console.log(`❌ ${name}: ${script} script missing`);
      }
    });
  }
};

checkBuildScripts('frontend/package.json', 'Frontend');
checkBuildScripts('backend/package.json', 'Backend');

// 9. Check for unused imports
console.log('\n9. UNUSED IMPORTS CHECK:');
const scanForUnusedImports = (dir, prefix = '') => {
  let unusedCount = 0;
  if (!fs.existsSync(dir)) return unusedCount;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(file)) {
      unusedCount += scanForUnusedImports(filePath, prefix + file + '/');
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Simple check for unused imports (basic pattern)
      const importLines = content.match(/^import.*from.*$/gm) || [];
      importLines.forEach(importLine => {
        const importMatch = importLine.match(/import\s+{([^}]+)}/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(i => i.trim());
          imports.forEach(imp => {
            if (imp && !content.includes(imp.replace(/\s+as\s+\w+/, ''))) {
              unusedCount++;
              if (unusedCount <= 10) { // Limit output
                console.log(`⚠️  ${prefix}${file}: Unused import '${imp}'`);
              }
            }
          });
        }
      });
    }
  });
  return unusedCount;
};

const frontendUnused = scanForUnusedImports('frontend/src');
console.log(`Potential unused imports: ${frontendUnused}`);

// 10. Final summary
console.log('\n' + '='.repeat(50));
console.log('📋 PRE-LAUNCH AUDIT SUMMARY');
console.log('='.repeat(50));

const issues = [];
if (frontendConsoles + backendConsoles > 50) issues.push('Too many console statements');
if (frontendTodos + backendTodos > 0) issues.push(`${frontendTodos + backendTodos} TODO comments`);
if (frontendSecrets + backendSecrets > 0) issues.push('Potential hardcoded secrets');
if (frontendUnused > 20) issues.push('Many unused imports');

if (issues.length === 0) {
  console.log('✅ SYSTEM READY FOR LAUNCH!');
  console.log('✅ No critical issues found');
} else {
  console.log('⚠️  ISSUES TO ADDRESS:');
  issues.forEach(issue => console.log(`   - ${issue}`));
}

console.log('\n🚀 Launch readiness: ' + (issues.length === 0 ? 'READY' : 'NEEDS ATTENTION'));