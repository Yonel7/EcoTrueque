import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Ya existe una cuenta con este email' });
    }

    // Crear nuevo usuario
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      rating: user.rating,
      totalRatings: user.totalRatings,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      rating: user.rating,
      totalRatings: user.totalRatings,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { googleToken, name, email, picture } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }

    // Buscar usuario existente
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Crear nuevo usuario con Google
      user = await User.create({
        name: name || 'Usuario Google',
        email: email.toLowerCase(),
        password: crypto.randomBytes(32).toString('hex'), // Password temporal
        googleId: googleToken,
        avatar: picture,
        isGoogleUser: true
      });
    } else {
      // Actualizar información de Google si no la tiene
      if (!user.googleId) {
        user.googleId = googleToken;
        user.isGoogleUser = true;
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      rating: user.rating,
      totalRatings: user.totalRatings,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    console.error('Error en autenticación Google:', error);
    res.status(500).json({ message: 'Error en autenticación con Google', error: error.message });
  }
};

export const facebookAuth = async (req, res) => {
  try {
    const { facebookToken, name, email, picture } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }

    // Buscar usuario existente
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Crear nuevo usuario con Facebook
      user = await User.create({
        name: name || 'Usuario Facebook',
        email: email.toLowerCase(),
        password: crypto.randomBytes(32).toString('hex'), // Password temporal
        facebookId: facebookToken,
        avatar: picture,
        isFacebookUser: true
      });
    } else {
      // Actualizar información de Facebook si no la tiene
      if (!user.facebookId) {
        user.facebookId = facebookToken;
        user.isFacebookUser = true;
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      rating: user.rating,
      totalRatings: user.totalRatings,
      avatar: user.avatar,
      token
    });
  } catch (error) {
    console.error('Error en autenticación Facebook:', error);
    res.status(500).json({ message: 'Error en autenticación con Facebook', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({ message: 'Si el email existe, recibirás un enlace de recuperación' });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Enviar email (simulado por ahora)
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      // Continuar aunque falle el email
    }

    res.json({ 
      message: 'Si el email existe, recibirás un enlace de recuperación',
      resetToken: resetToken // Solo para desarrollo, remover en producción
    });
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    const authToken = generateToken(user._id);

    res.json({
      message: 'Contraseña actualizada correctamente',
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      rating: user.rating,
      totalRatings: user.totalRatings,
      avatar: user.avatar,
      token: authToken
    });
  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, location, bio, phone, currentPassword, newPassword } = req.body;
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;

    // Handle password change
    if (currentPassword && newPassword) {
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Contraseña actual incorrecta' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      rating: user.rating,
      totalRatings: user.totalRatings,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Update avatar path
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      rating: user.rating,
      totalRatings: user.totalRatings,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Error al actualizar foto de perfil', error: error.message });
  }
};