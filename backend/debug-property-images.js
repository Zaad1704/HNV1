// Debug script to check property image issues
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkPropertyImages = async () => {
  await connectDB();
  
  try {
    const Property = require('./models/Property').default;
    
    // Find all properties
    const properties = await Property.find({}).select('name imageUrl createdAt').lean();
    
    console.log(`Found ${properties.length} properties`);
    
    // Check which properties have images
    const propertiesWithImages = properties.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
    const propertiesWithoutImages = properties.filter(p => !p.imageUrl || p.imageUrl.trim() === '');
    
    console.log(`Properties with images: ${propertiesWithImages.length}`);
    console.log(`Properties without images: ${propertiesWithoutImages.length}`);
    
    if (propertiesWithImages.length > 0) {
      console.log('\nProperties with images:');
      propertiesWithImages.forEach(p => {
        console.log(`- ${p.name}: ${p.imageUrl}`);
      });
    }
    
    if (propertiesWithoutImages.length > 0) {
      console.log('\nProperties without images:');
      propertiesWithoutImages.slice(0, 5).forEach(p => {
        console.log(`- ${p.name}: (no image)`);
      });
    }
    
  } catch (error) {
    console.error('Error checking properties:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkPropertyImages();