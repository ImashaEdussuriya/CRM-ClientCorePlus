const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const useInMemoryDB = process.env.USE_IN_MEMORY_DB === 'true' || !mongoUri;

    let conn;

    if (useInMemoryDB) {
      // Fallback for local development when no external MongoDB URI is configured.
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    } else {
      conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }

    console.log(`Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

     mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
  process.exit(0);
});

module.exports = connectDB;