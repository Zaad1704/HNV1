const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function testSuperAdminAuth() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await mongoose.connection.db.collection('users').findOne({ 
      email: 'alhaz.halim@gmail.com' 
    });
    
    if (user) {
      console.log('Super Admin user details:');
      console.log('- Role:', `"${user.role}"`);
      console.log('- Role length:', user.role.length);
      console.log('- Role type:', typeof user.role);
      console.log('- Exact match test:', user.role === 'Super Admin');
      console.log('- Includes test:', ['Super Admin', 'Super Moderator'].includes(user.role));
    } else {
      console.log('User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testSuperAdminAuth();