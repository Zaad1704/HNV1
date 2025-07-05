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
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function createSuperAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existingUser = await User.findOne({ email: 'alhaz.halim@gmail.com' });
    if (existingUser) {
      console.log('Super Admin already exists');
      await mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const superAdmin = new User({
      name: 'Super Admin',
      email: 'alhaz.halim@gmail.com',
      password: hashedPassword,
      role: 'Super Admin',
      status: 'active',
      isEmailVerified: true
    });

    await superAdmin.save();
    console.log('Super Admin created successfully');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

createSuperAdmin();
