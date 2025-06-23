import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // If MongoDB is not available, we'll use a fallback
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecotrueque';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️  Running in fallback mode without database');
    return false;
  }
};

export default connectDB;