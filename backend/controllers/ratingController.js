import Rating from '../models/Rating.js';
import User from '../models/User.js';
import Trade from '../models/Trade.js';

export const createRating = async (req, res) => {
  try {
    const { tradeId, ratedUserId, rating, comment } = req.body;

    // Verify trade exists and user was part of it
    const trade = await Trade.findById(tradeId);
    if (!trade || (trade.requester.toString() !== req.user._id.toString() && 
                   trade.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No puedes valorar este intercambio' });
    }

    // Check if trade is completed
    if (trade.status !== 'completado') {
      return res.status(400).json({ message: 'Solo puedes valorar intercambios completados' });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      rater: req.user._id,
      trade: tradeId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'Ya has valorado este intercambio' });
    }

    const newRating = new Rating({
      rater: req.user._id,
      rated: ratedUserId,
      trade: tradeId,
      rating,
      comment
    });

    await newRating.save();

    // Update user's average rating
    await updateUserRating(ratedUserId);

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear valoración', error: error.message });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const ratings = await Rating.find({ rated: userId })
      .populate('rater', 'name')
      .populate('trade')
      .sort('-createdAt');

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener valoraciones', error: error.message });
  }
};

const updateUserRating = async (userId) => {
  try {
    const ratings = await Rating.find({ rated: userId });
    
    if (ratings.length > 0) {
      const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
      await User.findByIdAndUpdate(userId, { 
        rating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length
      });
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};