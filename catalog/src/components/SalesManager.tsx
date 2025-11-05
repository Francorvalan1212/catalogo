import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, User, Phone, Mail, FileText, Calendar, DollarSign, Package } from 'lucide-react';
import { Product, Sale } from '../types/shirt';
import { storage } from '../utils/storage';

interface SalesManagerProps {
  products: Product[];
  isDark: boolean;
  onSaleComplete: () => void;
}

export const SalesManager: React.FC<SalesManagerProps> = ({
  products,
  isDark,
  onSaleComplete
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productsWithStock, setProductsWithStock] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    size: '',
    quantity: 1,
    paymentMethod: 'efectivo' as 'efectivo' | 'transferencia',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
    saleDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      const data = await storage.getSales();
      setSales(data);
      setLoading(false);
    };
    loadSales();
  }, []);

  useEffect(() => {
    // Filtrar productos con stock
    const filterProducts = () => {
      const filtered = products.filter(product => {
        const totalStock = Object.values(product.inventory).reduce((sum, stock) => sum + stock, 0);
        return totalStock > 0;
      });
      setProductsWithStock(filtered);
    };
    filterProducts();
  }, [products]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAvailableSizes = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return [];
    
    return product.sizes.filter(size => (product.inventory[size] || 0) > 0);
  };

  const getMaxQuantity = (productId: string, size: string) => {
    const product = products.find(p => p.id === productId);
    return product ? (product.inventory[size] || 0) : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const product = products.find(p => p.id === formData.productId);
    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    const availableStock = await storage.getAvailableStock(formData.productId, formData.size);
    if (availableStock < formData.quantity) {
      alert(`Stock insuficiente. Solo hay ${availableStock} unidades disponibles.`);
      return;
    }

    const saleData = {
      productId: formData.productId,
      productName: product.name,
      size: formData.size,
      quantity: formData.quantity,
      unitPrice: product.price,
      totalPrice: product.price * formData.quantity,
      paymentMethod: formData.paymentMethod,
      customerName: formData.customerName || undefined,
      customerPhone: formData.customerPhone || undefined,
      customerEmail: formData.customerEmail || undefined,
      notes: formData.notes || undefined,
      saleDate: formData.saleDate,
    };

    try {
      const newSale = await storage.addSale(saleData);
      if (newSale) {
        alert('✅ Venta registrada exitosamente');
        setFormData({
          productId: '',
          size: '',
          quantity: 1,
          paymentMethod: 'efectivo',
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          notes: '',
          saleDate: new Date().toISOString().split('T')[0],
        });
        setIsModalOpen(false);
        await onSaleComplete();
        const data = await storage.getSales();
        setSales(data);
      } else {
        alert('❌ Error al registrar la venta. Verifica el stock disponible.');
      }
    } catch (error) {
      console.error('Error al registrar venta:', error);
      alert('❌ Error al registrar la venta. Por favor, intenta nuevamente.');
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta venta? Esto restaurará el stock.')) {
      const success = await storage.deleteSale(saleId);
      if (success) {
        alert('✅ Venta eliminada y stock restaurado');
        await onSaleComplete();
        const data = await storage.getSales();
        setSales(data);
      } else {
        alert('❌ Error al eliminar la venta');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTotalSales = () => {
    return sales.reduce((total, sale) => total + sale.totalPrice, 0);
  };

  const getTotalQuantity = () => {
    return sales.reduce((total, sale) => total + sale.quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ShoppingCart className="w-6 h-6 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
            Gestión de Ventas
          </h2>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Registrar Venta
        </button>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Ventas</p>
              <p className="text-3xl font-bold">{formatPrice(getTotalSales())}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Unidades Vendidas</p>
              <p className="text-3xl font-bold">{getTotalQuantity()}</p>
            </div>
            <Package className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Transacciones</p>
              <p className="text-3xl font-bold">{sales.length}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">
            Historial de Ventas
          </h3>
        </div>

        {sales.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
              No hay ventas registradas
            </h3>
            <p className="text-gray-500 dark:text-gray-500 transition-colors duration-300">
              Comienza registrando tu primera venta
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Talle/Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        {sale.productName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        {sale.customerName || 'Cliente anónimo'}
                      </div>
                      {sale.customerPhone && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          {sale.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100 transition-colors duration-300">
                        Talle {sale.size} × {sale.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        sale.paymentMethod === 'efectivo' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                      }`}>
                        {sale.paymentMethod === 'efectivo' ? '💵 Efectivo' : '💳 Transferencia'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600 dark:text-green-400 transition-colors duration-300">
                        {formatPrice(sale.totalPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        title="Eliminar venta y restaurar stock"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto w-full shadow-2xl transition-colors duration-300">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 transition-colors duration-300">
                Registrar Nueva Venta
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Producto
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => {
                        handleInputChange('productId', e.target.value);
                        handleInputChange('size', '');
                      }}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {productsWithStock.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatPrice(product.price)}
                        </option>
                      ))}
                    </select>
                    {productsWithStock.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        No hay productos con stock disponible
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Talle
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                      disabled={!formData.productId}
                    >
                      <option value="">Seleccionar talle</option>
                      {getAvailableSizes(formData.productId).map((size) => {
                        const stock = getMaxQuantity(formData.productId, size);
                        return (
                          <option key={size} value={size}>
                            {size} (Stock: {stock})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={getMaxQuantity(formData.productId, formData.size)}
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                    {formData.productId && formData.size && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                        Stock disponible: {getMaxQuantity(formData.productId, formData.size)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Método de Pago
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="transferencia">💳 Transferencia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Fecha de Venta
                    </label>
                    <input
                      type="date"
                      value={formData.saleDate}
                      onChange={(e) => handleInputChange('saleDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Opcional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Información adicional sobre la venta..."
                  />
                </div>

                {formData.productId && formData.size && formData.quantity && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-300">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 transition-colors duration-300">
                      Resumen de la Venta
                    </h4>
                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1 transition-colors duration-300">
                      <p>Producto: {products.find(p => p.id === formData.productId)?.name}</p>
                      <p>Talle: {formData.size} × {formData.quantity}</p>
                      <p>Método de pago: {formData.paymentMethod === 'efectivo' ? '💵 Efectivo' : '💳 Transferencia'}</p>
                      <p>Precio unitario: {formatPrice(products.find(p => p.id === formData.productId)?.price || 0)}</p>
                      <p className="font-semibold text-lg">
                        Total: {formatPrice((products.find(p => p.id === formData.productId)?.price || 0) * formData.quantity)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={productsWithStock.length === 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Registrar Venta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};