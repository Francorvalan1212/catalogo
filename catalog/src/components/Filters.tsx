import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { FilterState } from '../types/shirt';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
  subcategories: string[];
  brands: string[];
  colors: string[];
  genders: string[];
  isDark?: boolean;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  categories,
  subcategories,
  brands,
  colors,
  genders,
  isDark = false,
}) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      category: '',
      subcategory: '',
      brand: '',
      color: '',
      gender: '',
      size: '',
      searchTerm: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">Filtros</h2>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filtro por categoría */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>

        {/* Filtro por subcategoría */}
        <select
          value={filters.subcategory}
          onChange={(e) => handleFilterChange('subcategory', e.target.value)}
          className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todos los tipos</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
            </option>
          ))}
        </select>

        {/* Filtro por marca */}
        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {/* Filtro por color */}
        <select
          value={filters.color}
          onChange={(e) => handleFilterChange('color', e.target.value)}
          className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todos los colores</option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        {/* Filtro por género */}
        <select
          value={filters.gender}
          onChange={(e) => handleFilterChange('gender', e.target.value)}
          className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todos los géneros</option>
          <option value="men">Hombre</option>
          <option value="women">Mujer</option>
          <option value="unisex">Unisex</option>
          <option value="kids">Niños</option>
        </select>

        {/* Filtro por talle */}
        <select
          value={filters.size}
          onChange={(e) => handleFilterChange('size', e.target.value)}
          className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">Todos los talles</option>
          <option value="XS">XS</option>
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
          <option value="XXL">XXL</option>
        </select>
      </div>
    </div>
  );
};

const getCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    football: 'Fútbol',
    casual: 'Casual',
    formal: 'Formal',
    sportswear: 'Deportivo',
    accessories: 'Accesorios'
  };
  return labels[category] || category;
};