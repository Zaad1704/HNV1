#!/usr/bin/env node

/**
 * Test script to verify view details functionality works on Render.com deployment
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://hnv-backend.onrender.com';
const FRONTEND_URL = 'https://www.hnvpm.com';

console.log('🔍 Testing View Details Functionality on Render.com Deployment\n');

// Test function to make HTTP requests
function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    console.log(`Testing: ${description}`);
    console.log(`URL: ${url}`);
    
    const req = protocol.get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`Response: ${JSON.stringify(parsed, null, 2)}`);
        } catch (e) {
          console.log(`Response (raw): ${data.substring(0, 200)}...`);
        }
        console.log('✅ Test completed\n');
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}\n`);
      resolve({ error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout\n');
      req.destroy();
      resolve({ error: 'timeout' });
    });
  });
}

async function runTests() {
  console.log('1. Testing Backend Health Check');
  await testEndpoint(`${BACKEND_URL}/health`, 'Backend Health');
  
  console.log('2. Testing API Health Check');
  await testEndpoint(`${BACKEND_URL}/api/health`, 'API Health');
  
  console.log('3. Testing Frontend Accessibility');
  await testEndpoint(FRONTEND_URL, 'Frontend Home Page');
  
  console.log('4. Testing CORS Configuration');
  await testEndpoint(`${BACKEND_URL}/api/debug`, 'CORS Debug Endpoint');
  
  console.log('5. Testing Property Routes (without auth - should get 401)');
  await testEndpoint(`${BACKEND_URL}/api/properties`, 'Properties Endpoint');
  
  console.log('6. Testing Expense Routes (without auth - should get 401)');
  await testEndpoint(`${BACKEND_URL}/api/expenses`, 'Expenses Endpoint');
  
  console.log('7. Testing Maintenance Routes (without auth - should get 401)');
  await testEndpoint(`${BACKEND_URL}/api/maintenance`, 'Maintenance Endpoint');
  
  console.log('📋 Test Summary:');
  console.log('- If backend health checks pass, the server is running');
  console.log('- If API endpoints return 401, authentication is working');
  console.log('- If CORS debug shows proper headers, CORS is configured');
  console.log('- The view details crash is likely due to missing authentication tokens');
  console.log('\n🔧 Next Steps:');
  console.log('1. Deploy the updated configuration to Render.com');
  console.log('2. Ensure environment variables are set correctly');
  console.log('3. Test with proper authentication tokens');
  console.log('4. Check browser console for specific error messages');
}

runTests().catch(console.error);