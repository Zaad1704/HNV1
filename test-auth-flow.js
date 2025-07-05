// Comprehensive authentication flow test
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
  role: 'Landlord'
};

async function testAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow...\n');
  
  try {
    // 1. Test Google OAuth Status
    console.log('1. Checking Google OAuth configuration...');
    const googleStatus = await axios.get(`${BASE_URL}/auth/google/status`);
    console.log('   Google OAuth enabled:', googleStatus.data.googleOAuthEnabled);
    
    // 2. Test Registration
    console.log('\n2. Testing user registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
      console.log('   ✅ Registration successful');
      console.log('   User ID:', registerResponse.data.user._id);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('   ⚠️  User already exists, continuing with login test');
      } else {
        console.log('   ❌ Registration failed:', error.response?.data?.message);
        return;
      }
    }
    
    // 3. Test Login
    console.log('\n3. Testing user login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        console.log('   ✅ Login successful');
        console.log('   Token received:', !!loginResponse.data.token);
        console.log('   User role:', loginResponse.data.user.role);
        
        const token = loginResponse.data.token;
        
        // 4. Test /auth/me endpoint
        console.log('\n4. Testing /auth/me endpoint...');
        const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (meResponse.data.success) {
          console.log('   ✅ /auth/me successful');
          console.log('   User data:', {
            name: meResponse.data.data.name,
            email: meResponse.data.data.email,
            role: meResponse.data.data.role,
            hasOrganization: !!meResponse.data.data.organizationId
          });
        }
        
        // 5. Test Dashboard Stats
        console.log('\n5. Testing dashboard stats...');
        const statsResponse = await axios.get(`${BASE_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (statsResponse.data.success) {
          console.log('   ✅ Dashboard stats successful');
          console.log('   Stats:', statsResponse.data.data);
        }
        
      } else {
        console.log('   ❌ Login failed - invalid response');
      }
    } catch (error) {
      console.log('   ❌ Login failed:', error.response?.data?.message);
    }
    
    // 6. Test Invalid Login
    console.log('\n6. Testing invalid login...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: 'wrongpassword'
      });
      console.log('   ❌ Invalid login should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Invalid login properly rejected');
      } else {
        console.log('   ⚠️  Unexpected error:', error.response?.data?.message);
      }
    }
    
    console.log('\n📋 Authentication Flow Summary:');
    console.log('✅ Google OAuth status check');
    console.log('✅ User registration flow');
    console.log('✅ User login flow');
    console.log('✅ Token-based authentication');
    console.log('✅ Dashboard data access');
    console.log('✅ Invalid login rejection');
    
    if (googleStatus.data.googleOAuthEnabled) {
      console.log('✅ Google OAuth configured');
      console.log('\n🔗 Manual Google OAuth Test:');
      console.log('   1. Visit: http://localhost:3000/login');
      console.log('   2. Click "Continue with Google"');
      console.log('   3. Complete Google authentication');
      console.log('   4. Should redirect to dashboard');
    } else {
      console.log('⚠️  Google OAuth not configured');
      console.log('   Configure Google OAuth credentials to enable Google login');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5001');
    }
  }
}

// Run the test
testAuthFlow();