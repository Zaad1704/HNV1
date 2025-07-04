#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 HNV Dashboard Issue Fixer');
console.log('=============================\n');

// Check for common dashboard crash causes
const checks = [
  {
    name: 'Frontend API Client Configuration',
    check: () => {
      const clientPath = path.join(__dirname, 'frontend/src/api/client.ts');
      if (!fs.existsSync(clientPath)) return { status: 'error', message: 'API client file not found' };
      
      const content = fs.readFileSync(clientPath, 'utf8');
      const issues = [];
      
      if (content.includes('timeout: 30000')) {
        issues.push('Timeout too high (30s) - should be 15s or less');
      }
      
      if (!content.includes('refetchOnWindowFocus: false')) {
        issues.push('Missing refetchOnWindowFocus: false - causes excessive API calls');
      }
      
      return issues.length > 0 
        ? { status: 'warning', message: issues.join(', ') }
        : { status: 'ok', message: 'API client configuration looks good' };
    }
  },
  {
    name: 'Dashboard Controller Error Handling',
    check: () => {
      const controllerPath = path.join(__dirname, 'backend/controllers/dashboardController.ts');
      if (!fs.existsSync(controllerPath)) return { status: 'error', message: 'Dashboard controller not found' };
      
      const content = fs.readFileSync(controllerPath, 'utf8');
      const issues = [];
      
      if (!content.includes('Promise.allSettled')) {
        issues.push('Not using Promise.allSettled for parallel queries');
      }
      
      if (content.includes('res.status(200).json({ success: true, data: [] })')) {
        issues.push('Returning success for errors - should return proper error status');
      }
      
      return issues.length > 0 
        ? { status: 'warning', message: issues.join(', ') }
        : { status: 'ok', message: 'Dashboard controller error handling looks good' };
    }
  },
  {
    name: 'Database Query Optimization',
    check: () => {
      const servicePath = path.join(__dirname, 'backend/services/dashboardService.ts');
      if (!fs.existsSync(servicePath)) return { status: 'error', message: 'Dashboard service not found' };
      
      const content = fs.readFileSync(servicePath, 'utf8');
      const issues = [];
      
      if (!content.includes('.lean()')) {
        issues.push('Not using .lean() for read-only queries - causes memory issues');
      }
      
      if (!content.includes('.select(')) {
        issues.push('Not selecting specific fields - fetching unnecessary data');
      }
      
      return issues.length > 0 
        ? { status: 'warning', message: issues.join(', ') }
        : { status: 'ok', message: 'Database queries are optimized' };
    }
  },
  {
    name: 'React Query Configuration',
    check: () => {
      const dashboardPath = path.join(__dirname, 'frontend/src/pages/DashboardPage.tsx');
      if (!fs.existsSync(dashboardPath)) return { status: 'error', message: 'Dashboard page not found' };
      
      const content = fs.readFileSync(dashboardPath, 'utf8');
      const issues = [];
      
      if (content.includes('refetchInterval: 30000')) {
        issues.push('Refetch interval too frequent (30s) - should be 60s or more');
      }
      
      if (!content.includes('retry:')) {
        issues.push('No retry configuration - can cause crashes on network issues');
      }
      
      return issues.length > 0 
        ? { status: 'warning', message: issues.join(', ') }
        : { status: 'ok', message: 'React Query configuration looks good' };
    }
  },
  {
    name: 'Error Boundary Implementation',
    check: () => {
      const errorBoundaryPath = path.join(__dirname, 'frontend/src/components/ErrorBoundary.tsx');
      if (!fs.existsSync(errorBoundaryPath)) return { status: 'error', message: 'Error boundary not found' };
      
      const appPath = path.join(__dirname, 'frontend/src/App.tsx');
      if (!fs.existsSync(appPath)) return { status: 'error', message: 'App.tsx not found' };
      
      const appContent = fs.readFileSync(appPath, 'utf8');
      
      if (!appContent.includes('<ErrorBoundary>')) {
        return { status: 'error', message: 'ErrorBoundary not wrapping app components' };
      }
      
      return { status: 'ok', message: 'Error boundary is properly implemented' };
    }
  }
];

// Run all checks
console.log('Running dashboard health checks...\n');

let hasErrors = false;
let hasWarnings = false;

checks.forEach((check, index) => {
  try {
    const result = check.check();
    const statusIcon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${index + 1}. ${check.name}: ${statusIcon}`);
    console.log(`   ${result.message}\n`);
    
    if (result.status === 'error') hasErrors = true;
    if (result.status === 'warning') hasWarnings = true;
  } catch (error) {
    console.log(`${index + 1}. ${check.name}: ❌`);
    console.log(`   Error running check: ${error.message}\n`);
    hasErrors = true;
  }
});

// Summary and recommendations
console.log('=============================');
console.log('SUMMARY AND RECOMMENDATIONS');
console.log('=============================\n');

if (!hasErrors && !hasWarnings) {
  console.log('✅ All checks passed! Your dashboard should be working properly.');
} else {
  if (hasErrors) {
    console.log('❌ Critical issues found that need immediate attention:');
    console.log('   - Check file paths and ensure all required files exist');
    console.log('   - Verify ErrorBoundary is properly implemented');
    console.log('');
  }
  
  if (hasWarnings) {
    console.log('⚠️  Performance and reliability improvements recommended:');
    console.log('   - Optimize database queries with .lean() and .select()');
    console.log('   - Configure proper retry logic for API calls');
    console.log('   - Reduce API call frequency to prevent rate limiting');
    console.log('   - Implement proper error handling in controllers');
    console.log('');
  }
}

console.log('ADDITIONAL TROUBLESHOOTING STEPS:');
console.log('1. Check browser console for JavaScript errors');
console.log('2. Monitor network tab for failed API requests');
console.log('3. Check backend logs for database connection issues');
console.log('4. Test dashboard health endpoint: GET /api/health/dashboard');
console.log('5. Verify user authentication and organization setup');
console.log('');

console.log('If issues persist, check:');
console.log('- Database connection stability');
console.log('- Memory usage and server resources');
console.log('- Network connectivity between frontend and backend');
console.log('- User permissions and subscription status');

process.exit(hasErrors ? 1 : 0);