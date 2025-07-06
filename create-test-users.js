const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// Import models
const User = require('./backend/models/User').default;
const Organization = require('./backend/models/Organization').default;
const Plan = require('./backend/models/Plan').default;
const Subscription = require('./backend/models/Subscription').default;

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingAdmin = await User.findOne({ email: 'admin@hnvpm.com' });
    const existingDemo = await User.findOne({ email: 'demo@hnvpm.com' });

    if (existingAdmin) {
      console.log('✅ Super Admin already exists');
    } else {
      // Create Super Admin
      const adminUser = new User({
        name: 'Super Admin',
        email: 'admin@hnvpm.com',
        password: 'Admin123!',
        role: 'Super Admin',
        status: 'active',
        isEmailVerified: true
      });
      await adminUser.save();
      console.log('✅ Super Admin created');
    }

    if (existingDemo) {
      console.log('✅ Demo user already exists');
    } else {
      // Get or create trial plan
      let trialPlan = await Plan.findOne({ name: 'Free Trial' });
      if (!trialPlan) {
        trialPlan = new Plan({
          name: 'Free Trial',
          price: 0,
          duration: 'monthly',
          features: ['Basic property management', 'Up to 2 properties', 'Basic support'],
          isActive: true
        });
        await trialPlan.save();
      }

      // Create demo organization
      const demoOrg = new Organization({
        name: "Demo Organization",
        status: 'active'
      });
      await demoOrg.save();

      // Create demo user
      const demoUser = new User({
        name: 'Demo User',
        email: 'demo@hnvpm.com',
        password: 'Demo123!',
        role: 'Landlord',
        organizationId: demoOrg._id,
        status: 'active',
        isEmailVerified: true
      });
      await demoUser.save();

      // Update organization with owner
      demoOrg.owner = demoUser._id;
      demoOrg.members = [demoUser._id];
      await demoOrg.save();

      // Create demo subscription
      const demoSubscription = new Subscription({
        organizationId: demoOrg._id,
        planId: trialPlan._id,
        status: 'trialing',
        trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        amount: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        maxProperties: 2,
        maxTenants: -1,
        maxAgents: 1,
        maxUsers: 3
      });
      await demoSubscription.save();

      console.log('✅ Demo user and organization created');
    }

    // Verify users exist
    const admin = await User.findOne({ email: 'admin@hnvpm.com' });
    const demo = await User.findOne({ email: 'demo@hnvpm.com' });

    console.log('\n📋 Test Credentials:');
    console.log('Super Admin:');
    console.log('Email: admin@hnvpm.com');
    console.log('Password: Admin123!');
    console.log('Status:', admin ? '✅ Active' : '❌ Not found');

    console.log('\nDemo User:');
    console.log('Email: demo@hnvpm.com');
    console.log('Password: Demo123!');
    console.log('Status:', demo ? '✅ Active' : '❌ Not found');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();