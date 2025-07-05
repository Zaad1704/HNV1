const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function createTestOrganizations() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check existing organizations
    const existingOrgs = await mongoose.connection.db.collection('organizations').countDocuments();
    console.log('Existing organizations:', existingOrgs);

    if (existingOrgs === 0) {
      // Create test organizations
      const testOrgs = [
        {
          name: 'Acme Properties',
          status: 'active',
          createdAt: new Date(),
          members: [],
          subscription: { status: 'active' }
        },
        {
          name: 'Downtown Rentals',
          status: 'active', 
          createdAt: new Date(),
          members: [],
          subscription: { status: 'trialing' }
        },
        {
          name: 'City View Management',
          status: 'inactive',
          createdAt: new Date(),
          members: [],
          subscription: { status: 'expired' }
        }
      ];

      await mongoose.connection.db.collection('organizations').insertMany(testOrgs);
      console.log('✅ Test organizations created');
    }

    // Show all organizations
    const orgs = await mongoose.connection.db.collection('organizations').find({}).toArray();
    console.log('\nAll organizations:');
    orgs.forEach(org => {
      console.log(`- ${org.name} (${org.status})`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestOrganizations();