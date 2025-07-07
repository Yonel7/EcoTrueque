import React, { useState, useEffect } from 'react';
import { X, Edit, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import * as productService from '../services/products';

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  condition: string;
  location?: string;
  tags?: string[];
  status: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
  product: Product | null;
}

const categories = [
  'Decoración', 'Jardín', 'Hogar', 'Iluminación', 'Papelería', 
  'Cuidado Personal', 'Electrónicos', 'Ropa', 'Libros', 'Otros'
];

const conditions = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'como_nuevo', label: 'Como nuevo' },
  { value: 'buen_estado', label: 'Buen estado' },
  { value: 'usado', label: 'Usado' }
];

const EditProductModal: React.FC<EditProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onProductUpdated, 
  product 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    tags: ''
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        category: product.category,
        condition: product.condition,
        location: product.location || '',
        tags: product.tags ? product.tags.join(', ') : ''
      });
      setExistingImages(product.images || []);
      setIsAvailable(product.status === 'disponible');
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!product) return;

    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (existingImages.length === 0 && newImageFiles.length === 0) {
      setError('El producto debe tener al menos una imagen');
      return;
    }

    setLoading(true);

    try {
      const updateData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        updateData.append(key, value);
      });

      // Add tags as array
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        updateData.append('tags', JSON.stringify(tagsArray));
      }

      // Add existing images
      updateData.append('existingImages', JSON.stringify(existingImages));

      // Add new images
      newImageFiles.forEach(file => {
        updateData.append('images', file);
      });

      await productService.updateProduct(product._id, updateData);
      
      // Update availability if changed
      if (isAvailable !== (product.status === 'disponible')) {
        await productService.toggleProductAvailability(product._id, isAvailable);
      }

      onProductUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Error al actualizar el producto. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (existingImages.length + files.length > 5) {
      setError('Máximo 5 imágenes permitidas en total');
      return;
    }
    
    setNewImageFiles(files);
    setError('');

    // Create previews
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === files.length) {
          setNewImagePreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    const newImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newImages);
  };

  const removeNewImage = (index: number) => {
    const newFiles = newImageFiles.filter((_, i) => i !== index);
    const newPreviews = newImagePreviews.filter((_, i) => i !== index);
    setNewImageFiles(newFiles);
    setNewImagePreviews(newPreviews);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Edit className="h-5 w-5 mr-2 text-green-600" />
            Editar Producto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Availability Toggle */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Disponibilidad del Producto</h3>
                  <p className="text-sm text-gray-500">
                    Controla si tu producto está disponible para intercambio
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <ToggleRight className="h-5 w-5" />
                      <span>Disponible</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-5 w-5" />
                      <span>No disponible</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título del Producto *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Condición *
                </label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  {conditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Lima, Perú"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas (separadas por comas)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: ecológico, reciclado, sostenible"
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes Actuales
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`http://localhost:5000${image}`}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Agregar Nuevas Imágenes
              </label>
              
              <div className="mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona imágenes adicionales (máximo {5 - existingImages.length} más)
                </p>
              </div>

              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Nueva imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-green-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Actualizar Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;