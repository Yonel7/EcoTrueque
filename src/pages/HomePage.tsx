import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Recycle, Users, ThumbsUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getProducts({ featured: 'true' });
        setFeaturedProducts(products.slice(0, 3)); // Máximo 3 productos
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const getConditionText = (condition: string) => {
    const conditions = {
      'nuevo': 'Nuevo',
      'como_nuevo': 'Como nuevo',
      'buen_estado': 'Buen estado',
      'usado': 'Usado'
    };
    return conditions[condition as keyof typeof conditions] || condition;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Intercambia productos ecológicos sin usar dinero
              </h1>
              <p className="text-xl mb-8">
                Únete a la comunidad de EcoTrueque y forma parte de la economía circular.
                Intercambia, reutiliza y ayuda al planeta.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold text-center hover:bg-green-100 transition"
                    >
                      Registrarse
                    </Link>
                    <Link
                      to="/products"
                      className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-green-500 transition"
                    >
                      Ver Productos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/profile"
                      className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold text-center hover:bg-green-100 transition"
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/products"
                      className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-green-500 transition"
                    >
                      Explorar Productos
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://images.pexels.com/photos/7262876/pexels-photo-7262876.jpeg"
                alt="Intercambio ecológico"
                className="rounded-lg shadow-xl max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¿Cómo funciona?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EcoTrueque te permite intercambiar productos de forma sencilla y sin usar dinero
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Publica tus productos</h3>
              <p className="text-gray-600">
                Sube fotos y detalles de los productos ecológicos que quieres intercambiar.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Encuentra intercambios</h3>
              <p className="text-gray-600">
                Busca productos que te interesen y propón un intercambio con tus artículos.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Realiza el trueque</h3>
              <p className="text-gray-600">
                Coordina con el otro usuario y completa el intercambio de forma segura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Productos Destacados</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre algunos de los productos más populares disponibles para intercambio
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Cargando productos destacados...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                    <img
                      src={product.images[0]?.startsWith('http') 
                        ? product.images[0] 
                        : `http://localhost:5000${product.images[0]}`}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg';
                      }}
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                        <Link
                          to={`/products?search=${encodeURIComponent(product.title)}`}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-10">
              <Link
                to="/products"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Ver todos los productos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Lo que dice nuestra comunidad</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce las experiencias de quienes ya forman parte de EcoTrueque
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-200 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h4 className="font-semibold">María González</h4>
                  <p className="text-gray-600 text-sm">Lima, Perú</p>
                </div>
              </div>
              <p className="text-gray-700">
                "EcoTrueque me ha permitido dar una segunda vida a objetos que ya no usaba y conseguir
                cosas que necesitaba sin gastar dinero. ¡Una idea genial para cuidar el planeta!"
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-200 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h4 className="font-semibold">Carlos Rodríguez</h4>
                  <p className="text-gray-600 text-sm">Arequipa, Perú</p>
                </div>
              </div>
              <p className="text-gray-700">
                "He realizado más de 15 intercambios en la plataforma. La comunidad es muy amable y
                comprometida con el medio ambiente. Totalmente recomendado."
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="bg-green-200 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h4 className="font-semibold">Laura Martínez</h4>
                  <p className="text-gray-600 text-sm">Cusco, Perú</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Gracias a EcoTrueque he conocido personas con mis mismos intereses ecológicos.
                Además de intercambiar productos, he aprendido mucho sobre sostenibilidad."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para unirte a EcoTrueque?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Forma parte de nuestra comunidad y comienza a intercambiar productos de forma sostenible.
            Juntos podemos hacer la diferencia.
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-100 transition"
            >
              Crear una cuenta gratis
            </Link>
          ) : (
            <Link
              to="/profile"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-100 transition"
            >
              Ir a mi perfil
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;