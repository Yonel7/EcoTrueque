import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const peruanCities = [
  'Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 
  'Huancayo', 'Tacna', 'Juliaca', 'Ica', 'Sullana', 'Ayacucho', 'Chincha Alta',
  'Huánuco', 'Pucallpa', 'Tarapoto', 'Puno', 'Tumbes', 'Talara', 'Jaén', 'Huaraz',
  'Abancay', 'Moquegua', 'Cerro de Pasco', 'Moyobamba', 'Chachapoyas', 'Bagua Grande'
];

const sampleUsers = [
  {
    name: 'María González',
    email: 'maria@example.com',
    password: '123456',
    location: 'Lima, Perú',
    bio: 'Amante del medio ambiente y la sostenibilidad'
  },
  {
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    password: '123456',
    location: 'Arequipa, Perú',
    bio: 'Coleccionista de productos ecológicos'
  },
  {
    name: 'Laura Martínez',
    email: 'laura@example.com',
    password: '123456',
    location: 'Cusco, Perú',
    bio: 'Defensora de la economía circular'
  },
  {
    name: 'Pedro Sánchez',
    email: 'pedro@example.com',
    password: '123456',
    location: 'Trujillo, Perú',
    bio: 'Entusiasta del reciclaje y reutilización'
  },
  {
    name: 'Ana López',
    email: 'ana@example.com',
    password: '123456',
    location: 'Piura, Perú',
    bio: 'Promotora de productos sostenibles'
  }
];

const sampleProducts = [
  {
    title: 'Macetas Recicladas de Botellas',
    description: 'Hermosas macetas hechas con botellas de plástico recicladas. Perfectas para plantas pequeñas y medianas. Incluye sistema de drenaje.',
    category: 'Decoración',
    images: ['https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg'],
    condition: 'como_nuevo'
  },
  {
    title: 'Kit de Compostaje Casero',
    description: 'Kit completo para iniciar tu propio compostaje en casa. Incluye contenedor, guía de uso y materiales iniciales.',
    category: 'Jardín',
    images: ['https://images.pexels.com/photos/5748316/pexels-photo-5748316.jpeg'],
    condition: 'nuevo'
  },
  {
    title: 'Bolsas Ecológicas Reutilizables',
    description: 'Set de 5 bolsas reutilizables para compras, hechas con tela reciclada. Resistentes y lavables.',
    category: 'Hogar',
    images: ['https://images.pexels.com/photos/6069552/pexels-photo-6069552.jpeg'],
    condition: 'buen_estado'
  },
  {
    title: 'Lámpara Solar Decorativa',
    description: 'Lámpara decorativa que funciona con energía solar. Ideal para jardines y espacios exteriores.',
    category: 'Iluminación',
    images: ['https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'],
    condition: 'como_nuevo'
  },
  {
    title: 'Cuadernos de Papel Reciclado',
    description: 'Pack de 3 cuadernos hechos con papel 100% reciclado. Varios tamaños disponibles.',
    category: 'Papelería',
    images: ['https://images.pexels.com/photos/6192337/pexels-photo-6192337.jpeg'],
    condition: 'nuevo'
  },
  {
    title: 'Jabones Artesanales Naturales',
    description: 'Jabones naturales hechos a mano con ingredientes orgánicos. Sin químicos dañinos.',
    category: 'Cuidado Personal',
    images: ['https://images.pexels.com/photos/6621339/pexels-photo-6621339.jpeg'],
    condition: 'nuevo'
  },
  {
    title: 'Organizador de Cartón Reciclado',
    description: 'Organizador de escritorio hecho con cartón reciclado. Múltiples compartimentos.',
    category: 'Hogar',
    images: ['https://images.pexels.com/photos/4792728/pexels-photo-4792728.jpeg'],
    condition: 'buen_estado'
  },
  {
    title: 'Plantas Suculentas en Macetas',
    description: 'Colección de plantas suculentas en macetas recicladas. Fáciles de cuidar.',
    category: 'Jardín',
    images: ['https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg'],
    condition: 'como_nuevo'
  },
  {
    title: 'Cargador Solar Portátil',
    description: 'Cargador solar portátil para dispositivos móviles. Perfecto para actividades al aire libre.',
    category: 'Electrónicos',
    images: ['https://images.pexels.com/photos/159397/solar-panel-array-power-sun-electricity-159397.jpeg'],
    condition: 'buen_estado'
  },
  {
    title: 'Ropa Vintage Restaurada',
    description: 'Piezas de ropa vintage cuidadosamente restauradas. Estilo único y sostenible.',
    category: 'Ropa',
    images: ['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'],
    condition: 'como_nuevo'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
    }
    
    console.log('Created users');
    
    // Create products
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      await Product.create({
        ...productData,
        owner: randomUser._id
      });
    }
    
    console.log('Created products');
    console.log('Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();