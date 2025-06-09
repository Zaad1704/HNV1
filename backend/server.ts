// backend/server.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app'; // Correctly import the named 'app' export

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI must be defined in your .env file');
}

// Connect to MongoDB and start the server
// AFTER (in server.ts)
mongoose.connect(MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('Database connection error:', err);
});
