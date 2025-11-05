import React, { useState, useMemo, useEffect } from 'react';
import { Product, FilterState } from '../types/shirt';
import { storage } from '../utils/storage';
import { ShirtCard } from './ShirtCard';
import { ShirtModal } from './ShirtModal';
import { Filters } from './Filters';
import { ThemeToggle } from './ThemeToggle';
import { Package, Search, Settings } from 'lucide-react';

interface PublicCatalogProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const PublicCatalog: React.FC<PublicCatalogProps> = ({ isDark, onToggleTheme }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    subcategory: '',
    brand: '',
    color: '',
    gender: '',
    size: '',
    searchTerm: '',
  });

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await storage.getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(product => product.category))).sort();
  }, [products]);

  const subcategories = useMemo(() => {
    return Array.from(new Set(products.map(product => product.subcategory))).sort();
  }, [products]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(product => product.brand).filter(Boolean))).sort();
  }, [products]);

  const colors = useMemo(() => {
    return Array.from(new Set(products.map(product => product.color))).sort();
  }, [products]);

  const genders = useMemo(() => {
    return Array.from(new Set(products.map(product => product.gender))).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = filters.searchTerm === '' || 
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        product.color.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesCategory = filters.category === '' || product.category === filters.category;
      const matchesSubcategory = filters.subcategory === '' || product.subcategory === filters.subcategory;
      const matchesBrand = filters.brand === '' || product.brand === filters.brand;
      const matchesColor = filters.color === '' || product.color === filters.color;
      const matchesGender = filters.gender === '' || product.gender === filters.gender;
      const matchesSize = filters.size === '' || product.sizes.includes(filters.size);

      return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesColor && matchesGender && matchesSize;
    });
  }, [products, filters]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAdminLogin = () => {
    window.location.href = '?admin=true';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full mr-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Catálogo de Ropa
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
                Descubre nuestra colección completa de ropa y accesorios
              </p>
            </div>
            
            {/* Theme Toggle and Admin Login */}
            <div className="absolute top-6 right-6 flex gap-3">
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
              <button
                onClick={handleAdminLogin}
                className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                title="Acceso Administrador"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Filters
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          colors={colors}
          genders={genders}
          isDark={isDark}
        />

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto transition-colors duration-300">
              No hay productos que coincidan con los filtros seleccionados. 
              Intenta ajustar los criterios de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ShirtCard
                  shirt={product}
                  onViewDetails={() => handleProductClick(product)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ShirtModal
        shirt={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};