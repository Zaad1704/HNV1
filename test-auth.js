const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAuthentication() {
    console.log('Testing Authentication System...\n');
    
    try {
        // Test 1: Health check
        console.log('1. Testing server health...');
        const health = await axios.get(`${API_BASE}/health`);
        console.log('✅ Server is running\n');
        
        // Test 2: Register a test user
        console.log('2. Testing user registration...');
        const registerData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            role: 'Landlord'
        };
        
        try {
            const register = await axios.post(`${API_BASE}/auth/register`, registerData);
            console.log('✅ User registration successful\n');
        } catch (err) {
            if (err.response?.data?.message?.includes('already exists')) {
                console.log('ℹ️  User already exists, continuing...\n');
            } else {
                throw err;
            }
        }
        
        // Test 3: Login with credentials
        console.log('3. Testing user login...');
        const loginData = {
            email: 'test@example.com',
            password: 'password123'
        };
        
        const login = await axios.post(`${API_BASE}/auth/login`, loginData);
        console.log('✅ User login successful');
        console.log('Token received:', login.data.token ? 'Yes' : 'No');
        console.log('User data:', login.data.user ? 'Yes' : 'No');
        
        // Test 4: Test protected route
        console.log('\n4. Testing protected route...');
        const token = login.data.token;
        const me = await axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Protected route access successful');
        console.log('User profile:', me.data.data.name);
        
        console.log('\n🎉 All authentication tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

// Run the test
testAuthentication();