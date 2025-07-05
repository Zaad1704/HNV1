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

async function checkAndFixSuperAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the super admin
    const superAdmin = await User.findOne({ email: 'alhaz.halim@gmail.com' });
    
    if (!superAdmin) {
      console.log('❌ Super Admin not found!');
      return;
    }

    console.log('✅ Super Admin found:');
    console.log('- Name:', superAdmin.name);
    console.log('- Email:', superAdmin.email);
    console.log('- Role:', superAdmin.role);
    console.log('- Status:', superAdmin.status);
    console.log('- Email Verified:', superAdmin.isEmailVerified);
    console.log('- Organization ID:', superAdmin.organizationId);
    console.log('- Has Password:', !!superAdmin.password);

    // Check if password is correct
    if (superAdmin.password) {
      const isPasswordCorrect = await bcrypt.compare('123456', superAdmin.password);
      console.log('- Password "123456" works:', isPasswordCorrect);
    }

    // Fix any issues
    let needsUpdate = false;
    const updates = {};

    if (superAdmin.role !== 'Super Admin') {
      updates.role = 'Super Admin';
      needsUpdate = true;
      console.log('🔧 Fixing role...');
    }

    if (superAdmin.status !== 'active') {
      updates.status = 'active';
      needsUpdate = true;
      console.log('🔧 Fixing status...');
    }

    if (!superAdmin.isEmailVerified) {
      updates.isEmailVerified = true;
      needsUpdate = true;
      console.log('🔧 Fixing email verification...');
    }

    // Reset password to ensure it's correct
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    updates.password = hashedPassword;
    needsUpdate = true;
    console.log('🔧 Resetting password...');

    if (needsUpdate) {
      await User.findByIdAndUpdate(superAdmin._id, updates);
      console.log('✅ Super Admin updated successfully!');
    } else {
      console.log('✅ Super Admin is already properly configured!');
    }

    // Test login credentials
    const updatedSuperAdmin = await User.findOne({ email: 'alhaz.halim@gmail.com' }).select('+password');
    const testPassword = await bcrypt.compare('123456', updatedSuperAdmin.password);
    console.log('🧪 Final password test:', testPassword ? '✅ PASS' : '❌ FAIL');

    await mongoose.disconnect();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndFixSuperAdmin();