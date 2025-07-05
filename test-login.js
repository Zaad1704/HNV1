const axios = require('axios');

async function testSuperAdminLogin() {
  try {
    console.log('Testing Super Admin login...');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'alhaz.halim@gmail.com',
      password: '123456'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
    // Test accessing super admin routes
    const token = response.data.token;
    const dashboardResponse = await axios.get('http://localhost:5001/api/super-admin/dashboard-stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Super Admin dashboard access successful!');
    console.log('Dashboard data:', dashboardResponse.data);
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testSuperAdminLogin();