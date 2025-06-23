import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
let isDBConnected = false;
connectDB().then((connected) => {
  isDBConnected = connected;
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://creative-mooncake-f23bcf.netlify.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route - API welcome message
app.get('/', (req, res) => {
  res.json({
    message: '🌱 Bienvenido a EcoTrueque API',
    version: '1.0.0',
    status: 'active',
    database: isDBConnected ? 'connected' : 'disconnected',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      trades: '/api/trades',
      notifications: '/api/notifications',
      messages: '/api/messages',
      ratings: '/api/ratings'
    },
    documentation: 'API REST para la plataforma de intercambio ecológico EcoTrueque'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'EcoTrueque API funcionando correctamente!',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    database: isDBConnected ? 'connected' : 'disconnected',
    mongodb: {
      status: isDBConnected ? 'connected' : 'disconnected',
      uri: process.env.MONGODB_URI ? 'configured' : 'not configured'
    },
    features: [
      'Autenticación completa con JWT',
      'Gestión de productos con imágenes',
      'Sistema de intercambios',
      'Notificaciones en tiempo real',
      'Mensajería privada',
      'Sistema de valoraciones',
      'Historial de trueques',
      'Base de datos MongoDB profesional',
      'Subida de archivos',
      'Validaciones de seguridad'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Algo salió mal!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: `Endpoint de API ${req.originalUrl} no encontrado`,
    availableEndpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/products',
      '/api/trades',
      '/api/notifications',
      '/api/messages',
      '/api/ratings'
    ]
  });
});

// General 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Ruta ${req.originalUrl} no encontrada`,
    suggestion: 'Esta es una API REST. Usa rutas que empiecen con /api/',
    apiRoot: '/',
    healthCheck: '/api/health'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 API Root: http://localhost:${PORT}/`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Base de datos: ${isDBConnected ? '✅ MongoDB Conectada' : '❌ MongoDB Desconectada'}`);
  
  if (!isDBConnected) {
    console.log(`\n⚠️  CONFIGURACIÓN REQUERIDA:`);
    console.log(`   1. Crea un archivo .env en la carpeta backend/`);
    console.log(`   2. Agrega: MONGODB_URI=tu_connection_string_de_mongodb`);
    console.log(`   3. Agrega: JWT_SECRET=tu_clave_secreta`);
    console.log(`   4. Reinicia el servidor\n`);
  }
  
  console.log(`\n🎯 FUNCIONALIDADES DISPONIBLES:`);
  console.log(`   📸 Subida de imágenes desde dispositivo`);
  console.log(`   ✏️  Edición de productos propios`);
  console.log(`   🔄 Control manual de disponibilidad`);
  console.log(`   🔔 Sistema de notificaciones`);
  console.log(`   💬 Mensajería privada entre usuarios`);
  console.log(`   ⭐ Sistema de valoraciones funcional`);
  console.log(`   📊 Historial completo de trueques`);
  console.log(`   🎨 Interfaz mejorada y responsive`);
  console.log(`   🗄️  Base de datos MongoDB profesional\n`);
});