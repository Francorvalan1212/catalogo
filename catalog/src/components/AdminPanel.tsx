import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Upload, X, ArrowLeft, Package, ShoppingCart } from 'lucide-react';
import { Product } from '../types/shirt';
import { storage } from '../utils/storage';
import { ImageCarousel } from './ImageCarousel';
import { ImageUpload } from './ImageUpload';
import { ThemeToggle } from './ThemeToggle';
import { InventoryManager } from './InventoryManager';
import { SalesManager } from './SalesManager';

interface AdminPanelProps {
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, isDark, onToggleTheme }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'inventory' | 'sales'>('catalog');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'casual' as 'football' | 'casual' | 'formal' | 'sportswear' | 'accessories',
    subcategory: '',
    brand: '',
    color: '',
    material: '',
    season: 'all-season' as 'spring' | 'summer' | 'fall' | 'winter' | 'all-season',
    gender: 'unisex' as 'men' | 'women' | 'unisex' | 'kids',
    team: '',
    country: '',
    playerType: 'fan' as 'fan' | 'player' | 'jugador',
    price: '',
    description: '',
    images: [] as string[],
    sizes: [] as string[],
    inventory: {} as { [size: string]: number },
  });

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const data = await storage.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];

    const newInventory = { ...formData.inventory };
    if (newSizes.includes(size) && !(size in newInventory)) {
      newInventory[size] = 0;
    } else if (!newSizes.includes(size) && size in newInventory) {
      delete newInventory[size];
    }

    setFormData(prev => ({ ...prev, sizes: newSizes, inventory: newInventory }));
  };

  const handleInventoryChange = (size: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [size]: Math.max(0, quantity) }
    }));
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand || '',
        color: product.color,
        material: product.material || '',
        season: product.season || 'all-season',
        gender: product.gender,
        team: product.team || '',
        country: product.country || '',
        playerType: product.playerType || 'fan',
        price: product.price.toString(),
        description: product.description || '',
        images: product.images,
        sizes: product.sizes,
        inventory: product.inventory,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'casual',
        subcategory: '',
        brand: '',
        color: '',
        material: '',
        season: 'all-season',
        gender: 'unisex',
        team: '',
        country: '',
        playerType: 'fan',
        price: '',
        description: '',
        images: [],
        sizes: [],
        inventory: {},
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      alert('Debe agregar al menos una imagen');
      return;
    }

    if (formData.sizes.length === 0) {
      alert('Debe seleccionar al menos un talle');
      return;
    }

    const hasInventory = Object.values(formData.inventory).some(qty => qty > 0);
    if (!hasInventory) {
      alert('Debe agregar stock para al menos un talle');
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      brand: formData.brand || undefined,
      color: formData.color,
      material: formData.material || undefined,
      season: formData.season,
      gender: formData.gender,
      team: formData.category === 'football' ? formData.team || undefined : undefined,
      country: formData.category === 'football' ? formData.country || undefined : undefined,
      playerType: formData.category === 'football' ? formData.playerType : undefined,
      price: parseFloat(formData.price),
      description: formData.description || undefined,
      images: formData.images,
      sizes: formData.sizes,
      inventory: formData.inventory,
    };

    try {
      if (editingProduct) {
        await storage.updateProduct(editingProduct.id, productData);
      } else {
        await storage.addProduct(productData);
      }
      await refreshData();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto. Por favor intenta de nuevo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await storage.deleteProduct(id);
      await refreshData();
    }
  };

  const handleBackToCatalog = () => {
    window.location.href = '/';
  };

  const getStockStatus = (product: Product) => {
    const totalStock = Object.values(product.inventory).reduce((total, stock) => total + stock, 0);
    if (totalStock === 0) return { text: 'Sin Stock', color: 'text-red-500' };
    if (totalStock <= 5) return { text: 'Stock Bajo', color: 'text-yellow-500' };
    return { text: 'En Stock', color: 'text-green-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl border-b border-white/20 dark:border-gray-700/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToCatalog}
                className="group flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Volver al Catálogo</span>
              </button>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
            </div>
            <div className="flex gap-4">
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
              <button
                onClick={onLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="flex space-x-1 mt-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl transition-colors duration-300">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Upload className="w-5 h-5 mr-2" />
              Catálogo
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'inventory'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Package className="w-5 h-5 mr-2" />
              Inventario
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'sales'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ventas
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                Gestión de Catálogo
              </h2>
              <button
                onClick={() => openModal()}
                className="group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Agregar Producto
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-2xl">
                  <Upload className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">
                  ¡Comienza agregando tu primer producto!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 transition-colors duration-300">
                  No hay productos en el catálogo. Haz clic en "Agregar Producto" para comenzar.
                </p>
                <button
                  onClick={() => openModal()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Agregar Primer Producto
                </button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => {
                  const stockStatus = getStockStatus(product);
                  const totalStock = Object.values(product.inventory).reduce((total, stock) => total + stock, 0);

                  return (
                    <div
                      key={product.id}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border border-white/20 dark:border-gray-700/20 h-[650px] flex flex-col"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ImageCarousel images={product.images} className="h-56 w-full flex-shrink-0" />

                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-gray-200 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
                        <div className="space-y-2 mb-4 flex-grow">
                          {product.category === 'football' && product.team ? (
                            <>
                              <p className="text-gray-600 dark:text-gray-400 flex items-center transition-colors duration-300">
                                <span className="font-semibold mr-2">Equipo:</span>
                                <span className="truncate">{product.team}</span>
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 flex items-center transition-colors duration-300">
                                <span className="font-semibold mr-2">País:</span>
                                <span className="truncate">{product.country}</span>
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-600 dark:text-gray-400 flex items-center transition-colors duration-300">
                                <span className="font-semibold mr-2">Marca:</span>
                                <span className="truncate">{product.brand || 'Sin marca'}</span>
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 flex items-center transition-colors duration-300">
                                <span className="font-semibold mr-2">Color:</span>
                                <span className="truncate">{product.color}</span>
                              </p>
                            </>
                          )}
                          <p className="text-blue-600 dark:text-blue-400 font-bold text-lg transition-colors duration-300">
                            ${product.price.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-semibold ${stockStatus.color} transition-colors duration-300`}>
                              {stockStatus.text}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              Stock: {totalStock}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold transition-colors duration-300">Talles y stock:</p>
                          <div className="grid grid-cols-3 gap-1">
                            {product.sizes.map((size) => (
                              <div
                                key={size}
                                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg text-xs font-medium text-center transition-colors duration-300"
                              >
                                {size}: {product.inventory[size] || 0}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                          <button
                            onClick={() => openModal(product)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            products={products}
            onInventoryUpdate={refreshData}
            isDark={isDark}
          />
        )}

        {activeTab === 'sales' && (
          <SalesManager
            products={products}
            isDark={isDark}
            onSaleComplete={refreshData}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto w-full shadow-2xl border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Ej: Camiseta Argentina Titular 2024"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Categoría
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    >
                      <option value="football">Fútbol</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="sportswear">Deportivo</option>
                      <option value="accessories">Accesorios</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Tipo de Producto
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ej: camiseta, pantalón, zapatos"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ej: Nike, Adidas, Puma"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ej: Azul, Rojo, Negro"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Material
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => handleInputChange('material', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Ej: Algodón 100%, Poliéster"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Género
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                    >
                      <option value="men">Hombre</option>
                      <option value="women">Mujer</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Niños</option>
                    </select>
                  </div>
                </div>

                {formData.category === 'football' && (
                  <div className="grid grid-cols-2 gap-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                        Equipo
                      </label>
                      <input
                        type="text"
                        value={formData.team}
                        onChange={(e) => handleInputChange('team', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Ej: Argentina, Barcelona"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                        País
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Ej: Argentina, España"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Precio (ARS)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="85000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Temporada
                    </label>
                    <select
                      value={formData.season}
                      onChange={(e) => handleInputChange('season', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                    >
                      <option value="spring">Primavera</option>
                      <option value="summer">Verano</option>
                      <option value="fall">Otoño</option>
                      <option value="winter">Invierno</option>
                      <option value="all-season">Todo el año</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Descripción detallada del producto..."
                  />
                </div>

                <ImageUpload
                  images={formData.images}
                  onChange={handleImagesChange}
                  maxImages={5}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                    Talles Disponibles
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                          formData.sizes.includes(size)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.sizes.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                      Stock por Talle
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.sizes.map((size) => (
                        <div key={size} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-300">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                            Talle {size}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.inventory[size] || 0}
                            onChange={(e) => handleInventoryChange(size, parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-8">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {editingProduct ? 'Actualizar' : 'Agregar'} Producto
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
