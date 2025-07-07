import api from './api';

export interface Message {
  _id: string;
  trade: string;
  sender: {
    _id: string;
    name: string;
  };
  recipient: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export const getTradeMessages = async (tradeId: string) => {
  const response = await api.get(`/messages/trade/${tradeId}`);
  return response.data;
};

export const sendMessage = async (tradeId: string, content: string) => {
  const response = await api.post(`/messages/trade/${tradeId}`, { content });
  return response.data;
};

export const getUnreadMessageCount = async () => {
  const response = await api.get('/messages/unread-count');
  return response.data;
};