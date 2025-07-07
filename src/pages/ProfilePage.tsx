import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Star, History, Settings, Plus, Trash2, Edit, MessageCircle, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import TradeMessaging from '../components/TradeMessaging';
import RatingModal from '../components/RatingModal';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import * as productService from '../services/products';
import * as tradeService from '../services/trades';
import * as ratingService from '../services/ratings';
import * as authService from '../services/auth';

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

interface Trade {
  _id: string;
  productOffered: Product;
  productRequested: Product;
  requester: {
    _id: string;
    name: string;
    rating?: number;
    totalRatings?: number;
  };
  owner: {
    _id: string;
    name: string;
    rating?: number;
    totalRatings?: number;
  };
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface Rating {
  _id: string;
  rater: {
    _id: string;
    name: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userTrades, setUserTrades] = useState<Trade[]>([]);
  const [userRatings, setUserRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState<{
    tradeId: string;
    ratedUserId: string;
    ratedUserName: string;
  } | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialize settings form with user data
  useEffect(() => {
    if (user) {
      setSettingsForm({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [user]);

  const fetchUserProducts = async () => {
    try {
      setLoading(true);
      const products = await productService.getUserProducts();
      setUserProducts(products);
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrades = async () => {
    try {
      setLoading(true);
      const trades = await tradeService.getUserTrades();
      setUserTrades(trades);
    } catch (error) {
      console.error('Error fetching user trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const ratings = await ratingService.getUserRatings(user._id);
      setUserRatings(ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'products') {
        fetchUserProducts();
      } else if (activeTab === 'trades') {
        fetchUserTrades();
      } else if (activeTab === 'ratings') {
        fetchUserRatings();
      }
    }
  }, [isAuthenticated, activeTab]);

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productService.deleteProduct(productId);
        fetchUserProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleToggleAvailability = async (productId: string, currentStatus: string) => {
    try {
      const newAvailability = currentStatus !== 'disponible';
      await productService.toggleProductAvailability(productId, newAvailability);
      fetchUserProducts();
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Error al cambiar la disponibilidad');
    }
  };

  const handleProductAdded = () => {
    fetchUserProducts();
  };

  const handleProductUpdated = () => {
    fetchUserProducts();
  };

  const handleRespondToTrade = async (tradeId: string, accept: boolean) => {
    try {
      await tradeService.respondToTrade(tradeId, accept);
      fetchUserTrades();
    } catch (error) {
      console.error('Error responding to trade:', error);
      alert('Error al responder al intercambio');
    }
  };

  const handleCompleteTrade = async (tradeId: string) => {
    try {
      await tradeService.completeTrade(tradeId);
      fetchUserTrades();
    } catch (error) {
      console.error('Error completing trade:', error);
      alert('Error al completar el intercambio');
    }
  };

  const handleOpenMessaging = (tradeId: string, otherUser: string) => {
    setSelectedTradeId(tradeId);
    setOtherUserName(otherUser);
    setShowMessaging(true);
  };

  const handleOpenRating = (tradeId: string, ratedUserId: string, ratedUserName: string) => {
    setRatingData({ tradeId, ratedUserId, ratedUserName });
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    fetchUserTrades();
    fetchUserRatings();
  };

  const handleAvatarUpdate = async (file: File) => {
    try {
      setAvatarLoading(true);
      const response = await authService.updateAvatar(file);
      
      // Update user context and localStorage
      updateUser(response);
      
      setSettingsSuccess('Foto de perfil actualizada correctamente');
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      setSettingsError(error.response?.data?.message || 'Error al actualizar la foto de perfil');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setSettingsLoading(true);

    try {
      const updateData: any = {
        name: settingsForm.name,
        email: settingsForm.email,
        location: settingsForm.location,
        bio: settingsForm.bio,
        phone: settingsForm.phone
      };

      // Only include password fields if both are provided
      if (settingsForm.currentPassword && settingsForm.newPassword) {
        if (settingsForm.newPassword.length < 6) {
          setSettingsError('La nueva contraseña debe tener al menos 6 caracteres');
          return;
        }
        updateData.currentPassword = settingsForm.currentPassword;
        updateData.newPassword = settingsForm.newPassword;
      }

      const response = await authService.updateProfile(updateData);
      setSettingsSuccess('Perfil actualizado correctamente');
      
      // Clear password fields
      setSettingsForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));

      // Update user context
      updateUser(response);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSettingsError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setSettingsLoading(false);
    }
  };

  const getConditionText = (condition: string) => {
    const conditions = {
      'nuevo': 'Nuevo',
      'como_nuevo': 'Como nuevo',
      'buen_estado': 'Buen estado',
      'usado': 'Usado'
    };
    return conditions[condition as keyof typeof conditions] || condition;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'disponible': 'bg-green-100 text-green-800',
      'reservado': 'bg-yellow-100 text-yellow-800',
      'intercambiado': 'bg-gray-100 text-gray-800',
      'no_disponible': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statuses = {
      'disponible': 'Disponible',
      'reservado': 'Reservado',
      'intercambiado': 'Intercambiado',
      'no_disponible': 'No disponible'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getTradeStatusColor = (status: string) => {
    const colors = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'aceptado': 'bg-blue-100 text-blue-800',
      'rechazado': 'bg-red-100 text-red-800',
      'completado': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-green-600 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-4">
                {user.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                    alt="Foto de perfil"
                    className="w-16 h-16 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="bg-white p-2 rounded-full">
                    <User className="h-12 w-12 text-green-600" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-green-100">{user.email}</p>
                {user.location && (
                  <p className="text-green-200 text-sm">{user.location}</p>
                )}
                {user.rating && user.rating > 0 && (
                  <div className="flex items-center mt-1">
                    <div className="flex mr-2">
                      {renderStars(user.rating)}
                    </div>
                    <span className="text-sm text-green-100">
                      {user.rating.toFixed(1)} ({user.totalRatings || 0} valoraciones)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveTab('settings')}
                className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg flex items-center"
              >
                <Settings className="h-5 w-5 mr-2" />
                Editar Perfil
              </button>
              <button 
                onClick={logout}
                className="bg-white text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
        
        {/* Profile Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'products'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-5 w-5 mr-2" />
              Mis Productos
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'trades'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="h-5 w-5 mr-2" />
              Mis Trueques
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'ratings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Star className="h-5 w-5 mr-2" />
              Valoraciones
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'settings'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Configuración
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* My Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Mis Productos</h2>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Añadir Producto
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Cargando productos...</p>
                </div>
              ) : userProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProducts.map((product) => (
                    <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
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
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{product.title}</h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        
                        {/* Availability Toggle */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Disponibilidad:</span>
                          <button
                            onClick={() => handleToggleAvailability(product._id, product.status)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                              product.status === 'disponible' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {product.status === 'disponible' ? (
                              <>
                                <ToggleRight className="h-4 w-4" />
                                <span className="text-xs">Disponible</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-4 w-4" />
                                <span className="text-xs">No disponible</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                            {getStatusText(product.status)}
                          </span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-sm text-red-600 hover:text-red-800 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes productos</h3>
                  <p className="text-gray-500 mb-4">
                    Comienza a publicar productos para intercambiar
                  </p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto hover:bg-green-700 transition"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Añadir Producto
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Trades Tab */}
          {activeTab === 'trades' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Mis Trueques</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Cargando trueques...</p>
                </div>
              ) : userTrades.length > 0 ? (
                <div className="space-y-4">
                  {userTrades.map((trade) => {
                    const isRequester = trade.requester._id === user._id;
                    const otherUser = isRequester ? trade.owner : trade.requester;
                    const myProduct = isRequester ? trade.productOffered : trade.productRequested;
                    const otherProduct = isRequester ? trade.productRequested : trade.productOffered;

                    return (
                      <div key={trade._id} className="border rounded-lg p-6 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTradeStatusColor(trade.status)}`}>
                              {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(trade.createdAt).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {(trade.status === 'aceptado' || trade.status === 'completado') && (
                              <button
                                onClick={() => handleOpenMessaging(trade._id, otherUser.name)}
                                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Chat
                              </button>
                            )}
                            
                            {trade.status === 'pendiente' && !isRequester && (
                              <>
                                <button
                                  onClick={() => handleRespondToTrade(trade._id, true)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                  Aceptar
                                </button>
                                <button
                                  onClick={() => handleRespondToTrade(trade._id, false)}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                  Rechazar
                                </button>
                              </>
                            )}
                            
                            {trade.status === 'aceptado' && (
                              <button
                                onClick={() => handleCompleteTrade(trade._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Marcar como completado
                              </button>
                            )}
                            
                            {trade.status === 'completado' && (
                              <button
                                onClick={() => handleOpenRating(trade._id, otherUser._id, otherUser.name)}
                                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 flex items-center"
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Valorar
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Mi producto</h4>
                            <div className="flex space-x-3">
                              <img
                                src={myProduct.images[0]?.startsWith('http') 
                                  ? myProduct.images[0] 
                                  : `http://localhost:5000${myProduct.images[0]}`}
                                alt={myProduct.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{myProduct.title}</p>
                                <p className="text-sm text-gray-600">{getConditionText(myProduct.condition)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Producto de {otherUser.name}
                              {otherUser.rating && otherUser.rating > 0 && (
                                <span className="ml-2 text-sm text-gray-500">
                                  ⭐ {otherUser.rating.toFixed(1)}
                                </span>
                              )}
                            </h4>
                            <div className="flex space-x-3">
                              <img
                                src={otherProduct.images[0]?.startsWith('http') 
                                  ? otherProduct.images[0] 
                                  : `http://localhost:5000${otherProduct.images[0]}`}
                                alt={otherProduct.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{otherProduct.title}</p>
                                <p className="text-sm text-gray-600">{getConditionText(otherProduct.condition)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes trueques</h3>
                  <p className="text-gray-500">
                    Cuando realices intercambios, aparecerán aquí
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Valoraciones Recibidas</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Cargando valoraciones...</p>
                </div>
              ) : userRatings.length > 0 ? (
                <div className="space-y-4">
                  {userRatings.map((rating) => (
                    <div key={rating._id} className="border rounded-lg p-6 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{rating.rater.name}</h4>
                          <div className="flex items-center mt-1">
                            <div className="flex mr-2">
                              {renderStars(rating.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {rating.rating}/5 estrellas
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 mt-2">{rating.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes valoraciones</h3>
                  <p className="text-gray-500">
                    Las valoraciones de otros usuarios aparecerán aquí
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Configuración de Perfil</h2>
              
              {/* Profile Photo Section */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Foto de Perfil</h3>
                <ProfilePhotoUpload
                  currentPhoto={user.avatar}
                  onPhotoUpdate={handleAvatarUpdate}
                  loading={avatarLoading}
                />
              </div>

              {settingsSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{settingsSuccess}</p>
                </div>
              )}

              {settingsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{settingsError}</p>
                </div>
              )}
              
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={settingsForm.name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+51 XXX XXX XXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={settingsForm.location}
                      onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                      placeholder="Ciudad, Perú"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={settingsForm.bio}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                    placeholder="Cuéntanos sobre ti..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Cambiar Contraseña</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={settingsForm.currentPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Deja estos campos vacíos si no quieres cambiar tu contraseña
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
                  >
                    {settingsLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onProductUpdated={handleProductUpdated}
        product={editingProduct}
      />

      <TradeMessaging
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
        tradeId={selectedTradeId}
        otherUserName={otherUserName}
      />

      {ratingData && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          tradeId={ratingData.tradeId}
          ratedUserId={ratingData.ratedUserId}
          ratedUserName={ratingData.ratedUserName}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};

export default ProfilePage;