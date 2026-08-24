import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB Atlas cluster.
 * Uses environment variable MONGO_URI or falls back to local instance for development.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/music_app');

    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, DB -> ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Exit process with failure code
    process.exit(1);
  }
};

export default connectDB;
