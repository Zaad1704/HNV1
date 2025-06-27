import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const fixSuperAdminEmail = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Super Admin email fix...');

    // Find all Super Admin users and set their email as verified
    const result = await User.updateMany(
      {
        role: 'Super Admin',
        isEmailVerified: false
      },
      {
        $set: { 
          isEmailVerified: true,
          status: 'active'
        }
      }
    );

    console.log(`Super Admin email fix complete: ${result.matchedCount} users matched, ${result.modifiedCount} users updated.`);

    // Also fix any users created before email verification was implemented
    const oldUsersResult = await User.updateMany(
      {
        createdAt: { $lt: new Date('2025-06-26T00:00:00.000Z') },
        isEmailVerified: false
      },
      {
        $set: { isEmailVerified: true }
      }
    );

    console.log(`Old users fix complete: ${oldUsersResult.matchedCount} users matched, ${oldUsersResult.modifiedCount} users updated.`);

  } catch (error) {
    console.error('Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

fixSuperAdminEmail();
