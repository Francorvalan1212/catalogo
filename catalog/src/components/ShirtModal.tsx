import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Package, ShoppingCart } from 'lucide-react';
import { Shirt } from '../types/shirt';

interface ShirtModalProps {
  shirt: Shirt;
  isOpen: boolean;
  onClose: () => void;
}

export const ShirtModal: React.FC<ShirtModalProps> = ({ shirt, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen) return null;

  const totalStock = Object.values(shirt.inventory || {}).reduce((sum, count) => sum + count, 0);
  const availableSizes = Object.entries(shirt.inventory || {})
    .filter(([_, count]) => count > 0)
    .map(([size, count]) => ({ size, count }));

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % shirt.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + shirt.images.length) % shirt.images.length);
  };

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

  const getStockStatus = () => {
    if (totalStock === 0) return { text: 'Sin Stock', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (totalStock <= 5) return { text: 'Stock Bajo', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { text: 'Stock OK', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon()}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{shirt.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize">{shirt.subcategory || shirt.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
              {stockStatus.text}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
              <img
                src={shirt.images[currentImageIndex]}
                alt={shirt.name}
                className="w-full h-full object-cover"
              />
              
              {shirt.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </>
              )}

              {/* Image indicators */}
              {shirt.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {shirt.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {shirt.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {shirt.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-blue-500'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${shirt.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Price */}
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${shirt.price}
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {shirt.brand && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Marca</p>
                    <p className="text-gray-800 dark:text-white">{shirt.brand}</p>
                  </div>
                )}
                {shirt.color && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Color</p>
                    <p className="text-gray-800 dark:text-white">{shirt.color}</p>
                  </div>
                )}
                {shirt.material && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Material</p>
                    <p className="text-gray-800 dark:text-white">{shirt.material}</p>
                  </div>
                )}
                {shirt.season && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Temporada</p>
                    <p className="text-gray-800 dark:text-white capitalize">{shirt.season}</p>
                  </div>
                )}
                {shirt.gender && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Género</p>
                    <p className="text-gray-800 dark:text-white capitalize">{shirt.gender}</p>
                  </div>
                )}
              </div>

              {/* Football specific fields */}
              {shirt.category === 'futbol' && (
                <div className="grid grid-cols-2 gap-4">
                  {shirt.team && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Equipo</p>
                      <p className="text-gray-800 dark:text-white">{shirt.team}</p>
                    </div>
                  )}
                  {shirt.country && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">País</p>
                      <p className="text-gray-800 dark:text-white">{shirt.country}</p>
                    </div>
                  )}
                  {shirt.playerType && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</p>
                      <p className="text-gray-800 dark:text-white capitalize">{shirt.playerType}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {shirt.description && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descripción</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{shirt.description}</p>
              </div>
            )}

            {/* Stock Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-800 dark:text-white">Disponibilidad por Talle</h3>
              </div>
              
              {availableSizes.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map(({ size, count }) => (
                    <div
                      key={size}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600"
                    >
                      <div className="font-semibold text-gray-800 dark:text-white">{size}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {count} {count === 1 ? 'unidad' : 'unidades'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-red-500 font-medium">Sin stock disponible</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Este producto no está disponible actualmente
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stock total:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{totalStock} unidades</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              disabled={totalStock === 0}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                totalStock > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {totalStock > 0 ? (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Disponible para venta
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Sin stock
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};