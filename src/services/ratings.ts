import api from './api';

export interface Rating {
  _id: string;
  rater: {
    _id: string;
    name: string;
  };
  rated: string;
  trade: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateRatingData {
  tradeId: string;
  ratedUserId: string;
  rating: number;
  comment?: string;
}

export const createRating = async (data: CreateRatingData) => {
  const response = await api.post('/ratings', data);
  return response.data;
};

export const getUserRatings = async (userId: string) => {
  const response = await api.get(`/ratings/user/${userId}`);
  return response.data;
};