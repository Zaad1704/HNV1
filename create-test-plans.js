const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

const PlanSchema = new mongoose.Schema({
  name: String,
  price: Number,
  features: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Plan = mongoose.model('Plan', PlanSchema);

async function createTestPlans() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if plans already exist
    const existingPlans = await Plan.countDocuments();
    if (existingPlans > 0) {
      console.log('Plans already exist:', existingPlans);
      await mongoose.disconnect();
      return;
    }

    const plans = [
      {
        name: 'Free Trial',
        price: 0,
        features: ['Up to 5 properties', 'Basic reporting', 'Email support'],
        isActive: true
      },
      {
        name: 'Basic',
        price: 29,
        features: ['Up to 20 properties', 'Advanced reporting', 'Priority support'],
        isActive: true
      },
      {
        name: 'Professional',
        price: 79,
        features: ['Up to 100 properties', 'Custom reports', 'Phone support', 'API access'],
        isActive: true
      },
      {
        name: 'Enterprise',
        price: 199,
        features: ['Unlimited properties', 'White-label', 'Dedicated support', 'Custom integrations'],
        isActive: true
      }
    ];

    await Plan.insertMany(plans);
    console.log('✅ Test plans created successfully!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestPlans();