const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing user registration...');
    
    const response = await axios.post('http://localhost:5001/api/auth/register', {
      name: 'Test Landlord',
      email: 'test@example.com',
      password: 'password123',
      role: 'Landlord'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();