const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  status: String,
  isEmailVerified: Boolean,
  organizationId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function debugLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const user = await User.findOne({ email: 'alhaz.halim@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('User found:');
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Status:', user.status);
    console.log('- Email Verified:', user.isEmailVerified);
    console.log('- Has Password:', !!user.password);

    // Test all possible passwords
    const passwords = ['123456', 'admin', 'password', 'superadmin'];
    
    for (const pwd of passwords) {
      const match = await bcrypt.compare(pwd, user.password);
      console.log(`- Password "${pwd}":`, match ? '✅' : '❌');
    }

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugLogin();