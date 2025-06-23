import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one rating per trade per user
ratingSchema.index({ rater: 1, trade: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);