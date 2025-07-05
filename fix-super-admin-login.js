const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function fixSuperAdminLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Hash the password exactly like the User model does
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Update the super admin with the new password
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'alhaz.halim@gmail.com' },
      { 
        $set: { 
          password: hashedPassword,
          role: 'Super Admin',
          status: 'active',
          isEmailVerified: true
        }
      }
    );

    console.log('Update result:', result.modifiedCount, 'documents modified');

    // Verify the fix
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'alhaz.halim@gmail.com' });
    const passwordMatch = await bcrypt.compare('123456', user.password);
    
    console.log('Password verification:', passwordMatch ? '✅ SUCCESS' : '❌ FAILED');
    
    await mongoose.disconnect();
    console.log('✅ Super admin login fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixSuperAdminLogin();