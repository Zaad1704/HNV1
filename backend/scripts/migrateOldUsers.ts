import mongoose from 'mongoose';
import User from '../models/User'; // Adjust path if you place the script elsewhere
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file, assuming it's in the project root or backend folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Adjust path to your .env file

const runMigration = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for migration...');

    // IMPORTANT: Set this to the exact date and time (in UTC) when the email verification feature went live.
    // All user accounts created BEFORE this date will have their isEmailVerified flag set to true.
    const FEATURE_ROLLOUT_DATE = new Date('2025-06-26T00:00:00.000Z'); // <<< REPLACE WITH YOUR ACTUAL ROLLOUT DATE

    console.log(`Migrating users created before: ${FEATURE_ROLLOUT_DATE.toISOString()}`);

    const result = await User.updateMany(
      {
        createdAt: { $lt: FEATURE_ROLLOUT_DATE }, // Users created before the feature rollout date
        isEmailVerified: false // And whose email is not currently verified
      },
      {
        $set: { isEmailVerified: true }
      }
    );

    console.log(`Migration complete: ${result.matchedCount} users matched, ${result.modifiedCount} users updated.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

runMigration();
