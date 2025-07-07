import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import * as ratingService from '../services/ratings';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: string;
  ratedUserId: string;
  ratedUserName: string;
  onRatingSubmitted: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  tradeId,
  ratedUserId,
  ratedUserName,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    try {
      await ratingService.createRating({
        tradeId,
        ratedUserId,
        rating,
        comment: comment.trim()
      });
      
      onRatingSubmitted();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      setError(error.response?.data?.message || 'Error al enviar la valoración. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    setError('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una calificación';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Valorar a {ratedUserName}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación *
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors duration-200 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center mt-3">
              <span className={`text-sm font-medium ${
                rating > 0 ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {getRatingText(hoveredRating || rating)}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Comparte tu experiencia con este usuario..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Enviar Valoración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;