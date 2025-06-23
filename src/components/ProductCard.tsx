import React, { useState } from 'react';
import { MapPin, Calendar, User, ArrowRightLeft, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TradeModal from './TradeModal';

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
    rating?: number;
    totalRatings?: number;
  };
  status: string;
  createdAt: string;
}

interface ProductCardProps {
  product: Product;
  onTradeProposed?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onTradeProposed }) => {
  const { user, isAuthenticated } = useAuth();
  const [showTradeModal, setShowTradeModal] = useState(false);

  const isOwner = user?._id === product.owner._id;
  const canTrade = isAuthenticated && !isOwner && product.status === 'disponible';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-3 w-3 fill-yellow-400 text-yellow-400 opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
        <div className="relative">
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
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
              {getStatusText(product.status)}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
              {product.category}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-2" />
              <span className="flex-1">{product.owner.name}</span>
              {product.owner.rating && product.owner.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {renderStars(product.owner.rating)}
                  </div>
                  <span className="text-xs text-gray-400">
                    ({product.owner.totalRatings || 0})
                  </span>
                </div>
              )}
            </div>
            
            {product.owner.location && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{product.owner.location}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(product.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {getConditionText(product.condition)}
            </span>
            
            {canTrade ? (
              <button
                onClick={() => setShowTradeModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Intercambiar
              </button>
            ) : isOwner ? (
              <span className="text-sm text-gray-500 px-4 py-2">Tu producto</span>
            ) : !isAuthenticated ? (
              <span className="text-sm text-gray-500 px-4 py-2">Inicia sesión para intercambiar</span>
            ) : (
              <span className="text-sm text-gray-500 px-4 py-2">No disponible</span>
            )}
          </div>
        </div>
      </div>

      {showTradeModal && (
        <TradeModal
          productRequested={product}
          onClose={() => setShowTradeModal(false)}
          onTradeProposed={onTradeProposed}
        />
      )}
    </>
  );
};

export default ProductCard;