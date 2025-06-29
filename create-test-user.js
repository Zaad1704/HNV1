const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple test user creation script
const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hnv');
    
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isEmailVerified: Boolean,
      organizationId: mongoose.Schema.Types.ObjectId
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);
    
    // Create test user
    await User.findOneAndUpdate(
      { email: 'admin@hnvpm.com' },
      {
        name: 'Test Admin',
        email: 'admin@hnvpm.com',
        password: hashedPassword,
        role: 'Super Admin',
        isEmailVerified: true,
        organizationId: new mongoose.Types.ObjectId()
      },
      { upsert: true }
    );
    
    console.log('Test user created: admin@hnvpm.com / Admin123!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser();