import Message from '../models/Message.js';
import Trade from '../models/Trade.js';

export const getTradeMessages = async (req, res) => {
  try {
    const { tradeId } = req.params;
    
    // Verify user is part of this trade
    const trade = await Trade.findById(tradeId);
    if (!trade || (trade.requester.toString() !== req.user._id.toString() && 
                   trade.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No tienes acceso a estos mensajes' });
    }

    const messages = await Message.find({ trade: tradeId })
      .populate('sender', 'name')
      .sort('createdAt');

    // Mark messages as read for the current user
    await Message.updateMany(
      { trade: tradeId, recipient: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { content } = req.body;

    // Verify user is part of this trade
    const trade = await Trade.findById(tradeId);
    if (!trade || (trade.requester.toString() !== req.user._id.toString() && 
                   trade.owner.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'No tienes acceso a este chat' });
    }

    // Determine recipient
    const recipientId = trade.requester.toString() === req.user._id.toString() 
      ? trade.owner 
      : trade.requester;

    const message = new Message({
      trade: tradeId,
      sender: req.user._id,
      recipient: recipientId,
      content
    });

    await message.save();
    await message.populate('sender', 'name');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar mensaje', error: error.message });
  }
};

export const getUnreadMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mensajes no leídos', error: error.message });
  }
};