import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as productService from '../services/products';
import * as tradeService from '../services/trades';

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  condition: string;
  owner: {
    _id: string;
    name: string;
    location?: string;
  };
  status: string;
  createdAt: string;
}

interface TradeModalProps {
  productRequested: Product;
  onClose: () => void;
  onTradeProposed?: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ productRequested, onClose, onTradeProposed }) => {
  const { user } = useAuth();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const products = await productService.getUserProducts();
        // Filter only available products
        const availableProducts = products.filter((p: Product) => p.status === 'disponible');
        setUserProducts(availableProducts);
      } catch (error) {
        console.error('Error fetching user products:', error);
        setError('Error al cargar tus productos');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setError('Por favor selecciona un producto para intercambiar');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await tradeService.proposeTrade(selectedProduct, productRequested._id);
      onTradeProposed?.();
      onClose();
      // You might want to show a success message here
    } catch (error) {
      console.error('Error proposing trade:', error);
      setError('Error al proponer el intercambio. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ArrowRightLeft className="h-5 w-5 mr-2 text-green-600" />
            Proponer Intercambio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Product being requested */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Producto solicitado:</h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start space-x-4">
                <img
                  src={productRequested.images[0] || 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg'}
                  alt={productRequested.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{productRequested.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{productRequested.description}</p>
                  <p className="text-sm text-green-700 mt-1">
                    Ofrecido por: {productRequested.owner.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User's products selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Selecciona tu producto para intercambiar:</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Cargando tus productos...</p>
              </div>
            ) : userProducts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No tienes productos disponibles</h4>
                <p className="text-gray-500">
                  Necesitas tener productos publicados y disponibles para poder intercambiar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {userProducts.map((product) => (
                    <label
                      key={product._id}
                      className={`flex items-start space-x-4 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedProduct === product._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedProduct"
                        value={product._id}
                        checked={selectedProduct === product._id}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="mt-1"
                      />
                      <img
                        src={product.images[0] || 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg'}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.title}</h4>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">
                          {product.category}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedProduct || submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Proponer Intercambio
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;