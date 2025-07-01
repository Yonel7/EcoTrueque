import api from './api';

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
  };
  type: 'trade_proposal' | 'trade_accepted' | 'trade_rejected' | 'trade_completed' | 'message';
  title: string;
  message: string;
  data?: {
    tradeId?: string;
    productId?: string;
  };
  read: boolean;
  createdAt: string;
}

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markAsRead = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await api.delete('/notifications/all');
  return response.data;
};