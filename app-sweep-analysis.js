#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 HNV App Comprehensive Sweep Analysis');
console.log('=====================================\n');

const issues = [];
const warnings = [];
const suggestions = [];

// Check backend files
const checkBackendIssues = () => {
  console.log('🔧 BACKEND ANALYSIS:');
  
  // Check for common issues in controllers
  const controllersPath = path.join(__dirname, 'backend/controllers');
  if (fs.existsSync(controllersPath)) {
    const controllers = fs.readdirSync(controllersPath);
    
    controllers.forEach(file => {
      if (file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(controllersPath, file), 'utf8');
        
        // Check for returning 200 with errors
        if (content.includes('res.status(200).json({ success: true, data: [] })')) {
          issues.push(`${file}: Returns 200 status with empty array on errors`);
        }
        
        // Check for missing error handling
        if (!content.includes('try {') || !content.includes('catch')) {
          warnings.push(`${file}: Missing try-catch error handling`);
        }
        
        // Check for missing .lean() in queries
        if (content.includes('.find(') && !content.includes('.lean()')) {
          suggestions.push(`${file}: Consider adding .lean() to queries for better performance`);
        }
        
        // Check for missing organizationId checks
        if (content.includes('req.user') && !content.includes('organizationId')) {
          warnings.push(`${file}: Missing organizationId authorization checks`);
        }
      }
    });
  }
  
  // Check models for issues
  const modelsPath = path.join(__dirname, 'backend/models');
  if (fs.existsSync(modelsPath)) {
    const models = fs.readdirSync(modelsPath);
    
    models.forEach(file => {
      if (file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(modelsPath, file), 'utf8');
        
        // Check for syntax errors
        if (content.includes('export default model;') && content.includes('export default model<')) {
          issues.push(`${file}: Duplicate export default statements`);
        }
        
        // Check for missing timestamps
        if (!content.includes('timestamps: true')) {
          suggestions.push(`${file}: Consider adding timestamps: true to schema`);
        }
      }
    });
  }
  
  console.log(`   Issues: ${issues.length}`);
  console.log(`   Warnings: ${warnings.length}`);
  console.log(`   Suggestions: ${suggestions.length}\n`);
};

// Check frontend files
const checkFrontendIssues = () => {
  console.log('🎨 FRONTEND ANALYSIS:');
  
  const frontendIssues = [];
  const frontendWarnings = [];
  
  // Check pages for common issues
  const pagesPath = path.join(__dirname, 'frontend/src/pages');
  if (fs.existsSync(pagesPath)) {
    const pages = fs.readdirSync(pagesPath);
    
    pages.forEach(file => {
      if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(path.join(pagesPath, file), 'utf8');
        
        // Check for missing error boundaries
        if (!content.includes('try') && !content.includes('catch') && !content.includes('ErrorBoundary')) {
          frontendWarnings.push(`${file}: Missing error handling`);
        }
        
        // Check for missing loading states
        if (content.includes('useQuery') && !content.includes('isLoading')) {
          frontendWarnings.push(`${file}: Missing loading state handling`);
        }
        
        // Check for hardcoded API URLs
        if (content.includes('http://') || content.includes('https://')) {
          frontendIssues.push(`${file}: Contains hardcoded URLs`);
        }
        
        // Check for missing key props in lists
        if (content.includes('.map(') && !content.includes('key=')) {
          frontendWarnings.push(`${file}: Possible missing key props in mapped lists`);
        }
        
        // Check for console.log statements
        if (content.includes('console.log')) {
          suggestions.push(`${file}: Contains console.log statements (should be removed for production)`);
        }
      }
    });
  }
  
  console.log(`   Issues: ${frontendIssues.length}`);
  console.log(`   Warnings: ${frontendWarnings.length}\n`);
  
  issues.push(...frontendIssues);
  warnings.push(...frontendWarnings);
};

// Check configuration files
const checkConfigIssues = () => {
  console.log('⚙️  CONFIGURATION ANALYSIS:');
  
  const configIssues = [];
  
  // Check package.json files
  const backendPackage = path.join(__dirname, 'backend/package.json');
  const frontendPackage = path.join(__dirname, 'frontend/package.json');
  
  if (fs.existsSync(backendPackage)) {
    const content = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
    if (!content.scripts || !content.scripts.build) {
      configIssues.push('backend/package.json: Missing build script');
    }
  }
  
  if (fs.existsSync(frontendPackage)) {
    const content = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
    if (!content.scripts || !content.scripts.build) {
      configIssues.push('frontend/package.json: Missing build script');
    }
  }
  
  // Check environment files
  const envFiles = ['.env', 'backend/.env', 'frontend/.env'];
  envFiles.forEach(envFile => {
    if (fs.existsSync(path.join(__dirname, envFile))) {
      const content = fs.readFileSync(path.join(__dirname, envFile), 'utf8');
      if (content.includes('localhost') && !content.includes('#')) {
        warnings.push(`${envFile}: Contains localhost URLs (check for production)`);
      }
    }
  });
  
  console.log(`   Issues: ${configIssues.length}\n`);
  issues.push(...configIssues);
};

// Check for security issues
const checkSecurityIssues = () => {
  console.log('🔒 SECURITY ANALYSIS:');
  
  const securityIssues = [];
  
  // Check for exposed secrets
  const checkForSecrets = (filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('password') && content.includes('=') && !content.includes('PASSWORD')) {
        securityIssues.push(`${filePath}: Possible exposed password`);
      }
      if (content.includes('secret') && content.includes('=') && !content.includes('SECRET')) {
        securityIssues.push(`${filePath}: Possible exposed secret`);
      }
    }
  };
  
  // Check common files for secrets
  ['.env', 'backend/.env', 'frontend/.env'].forEach(checkForSecrets);
  
  console.log(`   Issues: ${securityIssues.length}\n`);
  issues.push(...securityIssues);
};

// Run all checks
checkBackendIssues();
checkFrontendIssues();
checkConfigIssues();
checkSecurityIssues();

// Summary report
console.log('📊 SUMMARY REPORT:');
console.log('==================');
console.log(`🔴 Critical Issues: ${issues.length}`);
console.log(`🟡 Warnings: ${warnings.length}`);
console.log(`🔵 Suggestions: ${suggestions.length}\n`);

if (issues.length > 0) {
  console.log('🔴 CRITICAL ISSUES TO FIX:');
  issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('🟡 WARNINGS TO REVIEW:');
  warnings.slice(0, 10).forEach((warning, i) => console.log(`${i + 1}. ${warning}`));
  if (warnings.length > 10) console.log(`... and ${warnings.length - 10} more`);
  console.log('');
}

if (suggestions.length > 0) {
  console.log('🔵 SUGGESTIONS FOR IMPROVEMENT:');
  suggestions.slice(0, 5).forEach((suggestion, i) => console.log(`${i + 1}. ${suggestion}`));
  if (suggestions.length > 5) console.log(`... and ${suggestions.length - 5} more`);
  console.log('');
}

console.log('🎯 PRIORITY FIXES:');
console.log('1. Fix payments data loading issue');
console.log('2. Resolve any model syntax errors');
console.log('3. Ensure proper error handling in all controllers');
console.log('4. Add missing authorization checks');
console.log('5. Remove console.log statements for production');

process.exit(issues.length > 0 ? 1 : 0);