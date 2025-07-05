
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isEmailVerified: Boolean,
  status: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function testSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create super admin
    let superAdmin = await User.findOne({ role: 'Super Admin' });
    
    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      superAdmin = await User.create({
        name: 'Super Admin',
        email: 'admin@hnvpm.com',
        password: hashedPassword,
        role: 'Super Admin',
        isEmailVerified: true,
        status: 'active',
        createdAt: new Date()
      });
      console.log('✅ Created Super Admin user');
    } else {
      console.log('✅ Super Admin user exists');
    }

    console.log('Super Admin Details:');
    console.log('Email:', superAdmin.email);
    console.log('Role:', superAdmin.role);
    console.log('Status:', superAdmin.status);
    console.log('Verified:', superAdmin.isEmailVerified);

    await mongoose.disconnect();
    console.log('\n✅ Super Admin test completed');
  } catch (error) {
    console.error('❌ Super Admin test failed:', error);
    process.exit(1);
  }
}

testSuperAdmin();
