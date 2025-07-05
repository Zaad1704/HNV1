// Test script to verify Google authentication flow
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testGoogleAuthFlow() {
  console.log('🧪 Testing Google Authentication Flow...\n');
  
  try {
    // 1. Check Google OAuth status
    console.log('1. Checking Google OAuth configuration...');
    const statusResponse = await axios.get(`${BASE_URL}/auth/google/status`);
    console.log('   Status:', statusResponse.data);
    
    if (!statusResponse.data.googleOAuthEnabled) {
      console.log('❌ Google OAuth is not configured. Please set up credentials first.');
      return;
    }
    
    console.log('✅ Google OAuth is configured\n');
    
    // 2. Test dashboard stats endpoint without auth (should fail)
    console.log('2. Testing dashboard stats without authentication...');
    try {
      await axios.get(`${BASE_URL}/dashboard/stats`);
      console.log('❌ Dashboard stats should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Dashboard stats properly requires authentication');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data);
      }
    }
    
    console.log('\n3. Manual testing required:');
    console.log('   - Visit http://localhost:3000/login');
    console.log('   - Click "Continue with Google"');
    console.log('   - Complete Google authentication');
    console.log('   - Check browser console for debug logs');
    console.log('   - Verify redirect to dashboard (not blank page)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5001');
    }
  }
}

testGoogleAuthFlow();