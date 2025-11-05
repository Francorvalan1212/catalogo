import React, { useState } from 'react';
import { Package, Plus, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { Product } from '../types/shirt';
import { storage } from '../utils/storage';

interface InventoryManagerProps {
  products: Product[];
  onInventoryUpdate: () => void;
  isDark: boolean;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  onInventoryUpdate,
  isDark
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [inventoryUpdates, setInventoryUpdates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const handleInventoryChange = async (productId: string, size: string, change: number) => {
    const loadingKey = `${productId}-${size}`;
    
    try {
      // Marcar como cargando
      setLoading(prev => ({ ...prev, [loadingKey]: true }));
      
      console.log(`🔄 Cambio de inventario: ${productId}, talle ${size}, cambio: ${change}`);
      
      // Usar las funciones correctas del storage
      let success = false;
      if (change > 0) {
        // Incrementar stock
        success = await storage.incrementInventory(productId, size, change);
      } else if (change < 0) {
        // Decrementar stock
        success = await storage.decrementInventory(productId, size, Math.abs(change));
      }
      
      if (success) {
        console.log('✅ Inventario actualizado exitosamente');
        // Notificar al componente padre para refrescar la lista
        await onInventoryUpdate();
      } else {
        console.error('❌ Error al actualizar inventario');
        alert('Error al actualizar el inventario. Por favor, intenta nuevamente.');
      }
      
    } catch (error) {
      console.error('❌ Error en handleInventoryChange:', error);
      alert('Error al actualizar el inventario. Verifica la conexión con el servidor.');
    } finally {
      // Quitar estado de cargando
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'sin-stock', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' };
    if (stock <= 3) return { status: 'stock-bajo', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { status: 'stock-ok', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' };
  };

  const getTotalStock = (product: Product) => {
    return Object.values(product.inventory).reduce((total, stock) => total + stock, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Package className="w-6 h-6 text-blue-500 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
          Gestión de Inventario
        </h2>
      </div>

      <div className="grid gap-6">
        {products.map((product) => {
          const totalStock = getTotalStock(product);
          const hasLowStock = Object.values(product.inventory).some(stock => stock <= 3 && stock > 0);
          const hasNoStock = Object.values(product.inventory).every(stock => stock === 0);

          return (
            <div
              key={product.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 border-l-4 ${
                hasNoStock 
                  ? 'border-red-500' 
                  : hasLowStock 
                    ? 'border-yellow-500' 
                    : 'border-green-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {product.category === 'football' && product.team 
                        ? `${product.team} • ${product.country}`
                        : `${product.brand || 'Sin marca'} • ${product.color}`
                      }
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold transition-colors duration-300">
                      ${product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    hasNoStock 
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : hasLowStock
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  }`}>
                    {hasNoStock ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Sin Stock
                      </>
                    ) : hasLowStock ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Stock Bajo
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Stock OK
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    Total: {totalStock} unidades
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.sizes.map((size) => {
                  const stock = product.inventory[size] || 0;
                  const stockStatus = getStockStatus(stock);
                  const loadingKey = `${product.id}-${size}`;
                  const isLoading = loading[loadingKey];

                  return (
                    <div
                      key={size}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${stockStatus.bg} border-gray-200 dark:border-gray-600 ${
                        isLoading ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="text-center mb-3">
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                          {size}
                        </div>
                        <div className={`text-2xl font-bold ${stockStatus.color} transition-colors duration-300`}>
                          {stock}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {stock === 0 ? 'Sin stock' : stock === 1 ? '1 unidad' : `${stock} unidades`}
                        </div>
                      </div>

                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleInventoryChange(product.id, size, -1)}
                          disabled={stock === 0 || isLoading}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                          title="Restar 1 unidad"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleInventoryChange(product.id, size, 1)}
                          disabled={isLoading}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                          title="Agregar 1 unidad"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};