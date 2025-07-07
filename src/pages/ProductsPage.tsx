import React, { useState, useEffect } from 'react';
import { Search, Filter, Leaf, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import * as productService from '../services/products';

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

const categories = [
  'Todas', 'Decoración', 'Jardín', 'Hogar', 'Iluminación', 'Papelería', 'Cuidado Personal', 'Electrónicos', 'Ropa', 'Libros'
];

const ProductsPage = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params: any = {};
      
      if (selectedCategory !== 'Todas') {
        params.category = selectedCategory;
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const data = await productService.getProducts(params);
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError('Error al cargar productos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const handleTradeProposed = () => {
    // Refresh products after a trade is proposed
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Productos Disponibles</h1>
        
        <div className="w-full md:w-auto flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </button>

          {isAuthenticated && (
            <Link
              to="/profile"
              className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="h-5 w-5 mr-2" />
              Publicar Producto
            </Link>
          )}
        </div>
      </div>

      {/* Success Message */}
      {!error && !loading && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                ✅ Servidor conectado correctamente. Mostrando productos disponibles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {showFilters && (
        <div className="bg-green-50 p-4 rounded-lg mb-8">
          <h2 className="font-semibold mb-3">Categorías</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-green-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Cargando productos...</span>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onTradeProposed={handleTradeProposed}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Leaf className="h-16 w-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedCategory !== 'Todas' 
              ? 'Intenta con otros términos de búsqueda o categorías diferentes'
              : 'Aún no hay productos publicados'
            }
          </p>
          {isAuthenticated && (
            <Link
              to="/profile"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="h-5 w-5 mr-2" />
              Publicar el primer producto
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;