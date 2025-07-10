const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test tenant creation endpoint
async function testTenantCreation() {
  try {
    console.log('Testing tenant creation endpoint...');
    
    // First, test basic connectivity
    const healthCheck = await axios.get('http://localhost:5001/api/health');
    console.log('✅ Backend is running:', healthCheck.data);
    
    // Test auth endpoint
    try {
      const authTest = await axios.get('http://localhost:5001/api/auth/me');
      console.log('Auth test result:', authTest.status);
    } catch (authError) {
      console.log('⚠️ Auth test failed (expected):', authError.response?.status);
    }
    
    // Test tenant endpoint without auth (should fail)
    try {
      const tenantTest = await axios.get('http://localhost:5001/api/tenants');
      console.log('Tenant test result:', tenantTest.status);
    } catch (tenantError) {
      console.log('⚠️ Tenant test failed (expected - no auth):', tenantError.response?.status);
    }
    
    console.log('✅ Basic endpoint tests completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Start it with: npm run dev');
    }
  }
}

// Test frontend API client
async function testFrontendAPI() {
  try {
    console.log('\nTesting frontend API configuration...');
    
    // Test the API URL detection logic
    const getApiUrl = () => {
      // Simulate frontend environment
      const viteApiUrl = process.env.VITE_API_URL;
      if (viteApiUrl) {
        return viteApiUrl.endsWith('/api') ? viteApiUrl : `${viteApiUrl}/api`;
      }
      
      // Development fallback
      return 'http://localhost:5001/api';
    };
    
    const apiUrl = getApiUrl();
    console.log('✅ API URL:', apiUrl);
    
    // Test basic connectivity to the API
    const response = await axios.get(`${apiUrl}/health`);
    console.log('✅ Frontend API client can reach backend:', response.data);
    
  } catch (error) {
    console.error('❌ Frontend API test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🔍 Debugging tenant creation issues...\n');
  
  await testTenantCreation();
  await testFrontendAPI();
  
  console.log('\n📋 Common issues and solutions:');
  console.log('1. Backend not running: npm run dev in backend folder');
  console.log('2. Frontend not running: npm run dev in frontend folder');
  console.log('3. Port conflicts: Check if ports 5001 (backend) and 5173 (frontend) are free');
  console.log('4. CORS issues: Check backend CORS configuration');
  console.log('5. Authentication: Make sure user is logged in before adding tenant');
  console.log('6. File uploads: Check if upload directory exists and has write permissions');
  console.log('7. Database: Make sure MongoDB is running and connected');
}

runTests();