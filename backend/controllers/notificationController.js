import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .populate('data.tradeId')
      .populate('data.productId')
      .sort('-createdAt')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar notificación', error: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar notificaciones', error: error.message });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'Todas las notificaciones eliminadas' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar notificaciones', error: error.message });
  }
};

export const createNotification = async (recipientId, senderId, type, title, message, data = {}) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};