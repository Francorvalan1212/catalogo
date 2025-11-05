import React, { useState } from 'react';
import { Shirt } from '../types/shirt';
import { ShoppingCart, Eye, Package } from 'lucide-react';

interface ShirtCardProps {
  shirt: Shirt;
  onViewDetails: (shirt: Shirt) => void;
  showStock?: boolean;
}

export const ShirtCard: React.FC<ShirtCardProps> = ({ shirt, onViewDetails, showStock = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const totalStock = Object.values(shirt.inventory || {}).reduce((sum, count) => sum + count, 0);
  const availableSizes = Object.entries(shirt.inventory || {})
    .filter(([_, count]) => count > 0)
    .map(([size]) => size);

  const hasStock = totalStock > 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (shirt.images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  const getStockStatus = () => {
    if (!hasStock) return { text: 'Sin Stock', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (isLowStock) return { text: 'Stock Bajo', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { text: 'Stock OK', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' };
  };

  const stockStatus = getStockStatus();

  const getCategoryIcon = () => {
    switch (shirt.category) {
      case 'futbol': return '⚽';
      case 'casual': return '👕';
      case 'formal': return '👔';
      case 'deportivo': return '🏃';
      case 'accesorios': return '🎒';
      default: return '👕';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-[520px] flex flex-col">
      {/* Header with price and stock */}
      <div className="relative">
        <div className="absolute top-3 right-3 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          ${shirt.price}
        </div>
        {showStock && (
          <div className={`absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
            {stockStatus.text}
          </div>
        )}
      </div>

      {/* Image container */}
      <div 
        className="relative h-64 overflow-hidden cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onViewDetails(shirt)}
      >
        <img
          src={shirt.images[currentImageIndex]}
          alt={shirt.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Image indicators */}
        {shirt.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {shirt.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* View details overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Eye className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category and brand */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {getCategoryIcon()} {shirt.subcategory || shirt.category}
          </span>
          {shirt.brand && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {shirt.brand}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-2 flex-shrink-0">
          {shirt.name}
        </h3>

        {/* Category specific info */}
        <div className="space-y-1 mb-3 flex-1">
          {shirt.category === 'futbol' && shirt.team && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Equipo:</span> {shirt.team}
            </p>
          )}
          {shirt.category === 'futbol' && shirt.country && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">País:</span> {shirt.country}
            </p>
          )}
          {shirt.color && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Color:</span> {shirt.color}
            </p>
          )}
          {shirt.material && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Material:</span> {shirt.material}
            </p>
          )}
          {shirt.gender && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Género:</span> {shirt.gender}
            </p>
          )}
        </div>

        {/* Sizes */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Talles disponibles:</p>
          <div className="flex flex-wrap gap-1">
            {availableSizes.length > 0 ? (
              availableSizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md font-medium"
                >
                  {size}
                </span>
              ))
            ) : (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-md font-medium">
                Sin stock
              </span>
            )}
            {availableSizes.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">
                +{availableSizes.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Stock info */}
        {showStock && (
          <div className="mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Stock total: <span className="font-medium">{totalStock}</span>
            </span>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => onViewDetails(shirt)}
          disabled={!hasStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            hasStock
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {hasStock ? (
            <>
              <Eye className="w-4 h-4" />
              Ver detalles
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              Sin stock
            </>
          )}
        </button>
      </div>
    </div>
  );
};