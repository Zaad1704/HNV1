const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';

async function cleanDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Found collections:', collections.map(c => c.name));

    // Clean all collections except keep super admin user
    for (const collection of collections) {
      const collectionName = collection.name;
      
      if (collectionName === 'users') {
        // Keep only super admin
        const result = await mongoose.connection.db.collection('users').deleteMany({
          email: { $ne: 'alhaz.halim@gmail.com' }
        });
        console.log(`Cleaned users: ${result.deletedCount} deleted, kept super admin`);
      } else {
        // Delete everything from other collections
        const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`Cleaned ${collectionName}: ${result.deletedCount} documents deleted`);
      }
    }

    // Verify super admin still exists
    const superAdmin = await mongoose.connection.db.collection('users').findOne({
      email: 'alhaz.halim@gmail.com'
    });
    
    if (superAdmin) {
      console.log('✅ Super admin preserved:', superAdmin.email, superAdmin.role);
    } else {
      console.log('❌ Super admin not found!');
    }

    await mongoose.disconnect();
    console.log('✅ Database cleaned successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanDatabase();