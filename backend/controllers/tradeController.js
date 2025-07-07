import Trade from '../models/Trade.js';
import Product from '../models/Product.js';
import { createNotification } from './notificationController.js';

export const proposeTrade = async (req, res) => {
  try {
    const { productOfferedId, productRequestedId } = req.body;

    const [productOffered, productRequested] = await Promise.all([
      Product.findById(productOfferedId),
      Product.findById(productRequestedId)
    ]);

    if (!productOffered || !productRequested) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (productOffered.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No tienes permiso para ofrecer este producto' });
    }

    if (productRequested.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes intercambiar con tu propio producto' });
    }

    const trade = await Trade.create({
      productOffered: productOfferedId,
      productRequested: productRequestedId,
      requester: req.user._id,
      owner: productRequested.owner
    });

    // Create notification for the product owner
    await createNotification(
      productRequested.owner,
      req.user._id,
      'trade_proposal',
      'Nueva propuesta de intercambio',
      `${req.user.name} quiere intercambiar "${productOffered.title}" por tu "${productRequested.title}"`,
      { tradeId: trade._id, productId: productRequestedId }
    );

    await Promise.all([
      Product.findByIdAndUpdate(productOfferedId, { status: 'reservado' }),
      Product.findByIdAndUpdate(productRequestedId, { status: 'reservado' })
    ]);

    const populatedTrade = await Trade.findById(trade._id)
      .populate('productOffered')
      .populate('productRequested')
      .populate('requester', 'name')
      .populate('owner', 'name');

    res.status(201).json(populatedTrade);
  } catch (error) {
    res.status(400).json({ message: 'Error al proponer trueque', error: error.message });
  }
};

export const respondToTrade = async (req, res) => {
  try {
    const { accept } = req.body;
    const trade = await Trade.findOne({
      _id: req.params.id,
      owner: req.user._id,
      status: 'pendiente'
    }).populate('requester', 'name').populate('productOffered').populate('productRequested');

    if (!trade) {
      return res.status(404).json({ message: 'Trueque no encontrado' });
    }

    if (accept) {
      trade.status = 'aceptado';
      trade.acceptedAt = new Date();
      
      // Create notification for requester
      await createNotification(
        trade.requester._id,
        req.user._id,
        'trade_accepted',
        'Intercambio aceptado',
        `${req.user.name} ha aceptado tu propuesta de intercambio`,
        { tradeId: trade._id }
      );

      await Promise.all([
        Product.findByIdAndUpdate(trade.productOffered._id, { status: 'intercambiado' }),
        Product.findByIdAndUpdate(trade.productRequested._id, { status: 'intercambiado' })
      ]);
    } else {
      trade.status = 'rechazado';

      // Create notification for requester
      await createNotification(
        trade.requester._id,
        req.user._id,
        'trade_rejected',
        'Intercambio rechazado',
        `${req.user.name} ha rechazado tu propuesta de intercambio`,
        { tradeId: trade._id }
      );

      await Promise.all([
        Product.findByIdAndUpdate(trade.productOffered._id, { status: 'disponible' }),
        Product.findByIdAndUpdate(trade.productRequested._id, { status: 'disponible' })
      ]);
    }

    await trade.save();
    res.json(trade);
  } catch (error) {
    res.status(400).json({ message: 'Error al responder al trueque', error: error.message });
  }
};

export const completeTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      $or: [{ requester: req.user._id }, { owner: req.user._id }],
      status: 'aceptado'
    }).populate('requester', 'name').populate('owner', 'name');

    if (!trade) {
      return res.status(404).json({ message: 'Trueque no encontrado o no está en estado aceptado' });
    }

    trade.status = 'completado';
    trade.completedAt = new Date();
    await trade.save();

    // Create notification for the other user
    const otherUserId = trade.requester._id.toString() === req.user._id.toString() 
      ? trade.owner._id 
      : trade.requester._id;

    const otherUserName = trade.requester._id.toString() === req.user._id.toString() 
      ? trade.owner.name 
      : trade.requester.name;

    await createNotification(
      otherUserId,
      req.user._id,
      'trade_completed',
      'Intercambio completado',
      `${req.user.name} ha marcado el intercambio como completado`,
      { tradeId: trade._id }
    );

    // Populate the trade before sending response
    const populatedTrade = await Trade.findById(trade._id)
      .populate('productOffered')
      .populate('productRequested')
      .populate('requester', 'name rating totalRatings')
      .populate('owner', 'name rating totalRatings');

    res.json(populatedTrade);
  } catch (error) {
    console.error('Error completing trade:', error);
    res.status(500).json({ message: 'Error al completar trueque', error: error.message });
  }
};

export const getUserTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      $or: [{ requester: req.user._id }, { owner: req.user._id }]
    })
      .populate('productOffered')
      .populate('productRequested')
      .populate('requester', 'name rating totalRatings')
      .populate('owner', 'name rating totalRatings')
      .sort('-createdAt');

    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener trueques', error: error.message });
  }
};