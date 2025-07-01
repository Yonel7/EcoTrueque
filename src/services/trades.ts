import api from './api';
import { Product } from './products';

export interface Trade {
  _id: string;
  productOffered: Product;
  productRequested: Product;
  requester: {
    _id: string;
    name: string;
  };
  owner: {
    _id: string;
    name: string;
  };
  status: 'pendiente' | 'aceptado' | 'rechazado' | 'completado';
  createdAt: string;
  completedAt?: string;
}

export const proposeTrade = async (productOfferedId: string, productRequestedId: string) => {
  const response = await api.post('/trades', { productOfferedId, productRequestedId });
  return response.data;
};

export const respondToTrade = async (tradeId: string, accept: boolean) => {
  const response = await api.put(`/trades/${tradeId}/respond`, { accept });
  return response.data;
};

export const completeTrade = async (tradeId: string) => {
  const response = await api.put(`/trades/${tradeId}/complete`);
  return response.data;
};

export const getUserTrades = async () => {
  const response = await api.get('/trades/user');
  return response.data;
};