import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';

export const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('Files received:', req.files);
    console.log('User:', req.user);

    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const productData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      condition: req.body.condition,
      location: req.body.location || '',
      owner: req.user._id
    };

    // Validar campos requeridos
    if (!productData.title || !productData.description || !productData.category || !productData.condition) {
      return res.status(400).json({ message: 'Todos los campos obligatorios son requeridos' });
    }

    // Manejar imágenes subidas
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/${file.filename}`);
      console.log('Images processed:', productData.images);
    } else {
      return res.status(400).json({ message: 'Se requiere al menos una imagen' });
    }

    // Procesar tags si existen
    if (req.body.tags) {
      try {
        if (typeof req.body.tags === 'string') {
          // Si es string, intentar parsearlo como JSON o dividirlo por comas
          try {
            productData.tags = JSON.parse(req.body.tags);
          } catch {
            productData.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } else if (Array.isArray(req.body.tags)) {
          productData.tags = req.body.tags;
        }
      } catch (error) {
        console.error('Error processing tags:', error);
        productData.tags = [];
      }
    }

    console.log('Final product data:', productData);

    // Crear el producto
    const product = await Product.create(productData);
    console.log('Product created:', product);
    
    // Poblar el producto con información del owner
    const populatedProduct = await Product.findById(product._id)
      .populate('owner', 'name location rating totalRatings');
    
    console.log('Product populated:', populatedProduct);
    
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Limpiar archivos subidos si hay error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      });
    }
    
    res.status(500).json({ 
      message: 'Error al crear producto', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { category, search, status = 'disponible', featured } = req.query;
    let query = { status };

    if (category && category !== 'todas' && category !== 'Todas') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let products;
    
    if (featured === 'true') {
      // Para productos destacados, obtener los más recientes con mejor rating del owner
      products = await Product.find(query)
        .populate('owner', 'name location rating totalRatings')
        .sort({ 'owner.rating': -1, createdAt: -1 })
        .limit(3);
    } else {
      products = await Product.find(query)
        .populate('owner', 'name location rating totalRatings')
        .sort('-createdAt');
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

export const getUserProducts = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const products = await Product.find({ owner: req.user._id })
      .sort('-createdAt');
    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Error al obtener productos del usuario', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const updateData = { ...req.body };

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      
      // If there are existing images in the request body, combine them
      if (updateData.existingImages) {
        try {
          const existingImages = JSON.parse(updateData.existingImages);
          updateData.images = [...existingImages, ...newImages];
        } catch (error) {
          updateData.images = newImages;
        }
        delete updateData.existingImages;
      } else {
        updateData.images = newImages;
      }
    } else if (updateData.existingImages) {
      // Only existing images, no new ones
      try {
        updateData.images = JSON.parse(updateData.existingImages);
      } catch (error) {
        // Keep existing images as is
      }
      delete updateData.existingImages;
    }

    // Parse tags if they exist
    if (updateData.tags) {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (error) {
        updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateData,
      { new: true }
    ).populate('owner', 'name location rating totalRatings');

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Delete associated image files
    if (product.images && product.images.length > 0) {
      product.images.forEach(imagePath => {
        if (imagePath.startsWith('/uploads/')) {
          const fullPath = path.join(process.cwd(), imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });
    }

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};

export const toggleProductAvailability = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const { id } = req.params;
    const { available } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { status: available ? 'disponible' : 'no_disponible' },
      { new: true }
    ).populate('owner', 'name location rating totalRatings');

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error toggling product availability:', error);
    res.status(500).json({ message: 'Error al cambiar disponibilidad', error: error.message });
  }
};