import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No autorizado - Token requerido' });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Obtener usuario de la base de datos
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      // Agregar usuario a la request
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT Error:', jwtError.message);
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};