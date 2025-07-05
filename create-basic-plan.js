const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function createBasicPlan() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Create a basic free plan
    const basicPlan = {
      name: 'Free Trial',
      price: 0,
      duration: 'monthly',
      interval: 'monthly',
      features: ['Basic property management', 'Up to 5 tenants', 'Email support'],
      limits: {
        maxProperties: 5,
        maxTenants: 5,
        maxAgents: 1
      },
      isPublic: true,
      isActive: true,
      trialDays: 14,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await mongoose.connection.db.collection('plans').insertOne(basicPlan);
    console.log('✅ Basic plan created');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createBasicPlan();