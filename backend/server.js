const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

const connectToDatabase = async () => {
  try {
    if (process.env.MONGO_URI || process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
      console.log('MongoDB connected successfully.');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

const startServer = async () => {
  await connectToDatabase();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

startServer();