// src/utils/storage.ts
import { Product } from '../types/shirt';

const API_BASE_URL = 'https://catalogo-production-abc6.up.railway.app';

// Función para comprimir imágenes de manera agresiva
export async function comprimirImagen(imagenBase64: string, maxWidth: number = 600, calidad: number = 0.5): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let ancho = img.width;
      let alto = img.height;
      
      if (ancho > maxWidth) {
        alto = (alto * maxWidth) / ancho;
        ancho = maxWidth;
      }
      
      canvas.width = ancho;
      canvas.height = alto;
      
      ctx?.drawImage(img, 0, 0, ancho, alto);
      
      const imagenComprimida = canvas.toDataURL('image/jpeg', calidad);
      resolve(imagenComprimida);
    };
    
    img.onerror = () => reject(new Error('Error al cargar la imagen para compresión'));
    img.src = imagenBase64;
  });
}

// Función para optimizar imágenes del producto
export async function optimizarImagenesProducto(producto: Omit<Product, 'id' | 'created_at'>): Promise<Omit<Product, 'id' | 'created_at'>> {
  const productoOptimizado = { ...producto };
  
  if (productoOptimizado.images && productoOptimizado.images.length > 0) {
    const imagenesOptimizadas: string[] = [];
    
    for (const imagen of productoOptimizado.images) {
      if (imagen.startsWith('data:image')) {
        try {
          const imagenComprimida = await comprimirImagen(imagen, 600, 0.5);
          imagenesOptimizadas.push(imagenComprimida);
        } catch (error) {
          console.error('Error comprimiendo imagen:', error);
          imagenesOptimizadas.push(imagen);
        }
      } else {
        imagenesOptimizadas.push(imagen);
      }
    }
    
    productoOptimizado.images = imagenesOptimizadas;
  }
  
  return productoOptimizado;
}

// Función para diagnosticar la conexión con MongoDB
export async function diagnosticarMongoDB(): Promise<{ conectado: boolean; mensaje: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    
    if (response.status === 404) {
      return {
        conectado: false,
        mensaje: 'ERROR: Endpoint /products no encontrado. Verifica tu servidor Express.'
      };
    }
    
    if (!response.ok) {
      return {
        conectado: false,
        mensaje: `ERROR: API respondió con status ${response.status}`
      };
    }
    
    const products = await response.json();
    
    if (Array.isArray(products)) {
      return {
        conectado: true,
        mensaje: `Conexión exitosa. ${products.length} productos encontrados.`
      };
    } else {
      return {
        conectado: false,
        mensaje: 'ERROR: La respuesta no es un array de productos'
      };
    }
    
  } catch (error) {
    return {
      conectado: false,
      mensaje: `ERROR: No se pudo conectar con la API. Verifica que el servidor esté ejecutándose en ${API_BASE_URL}`
    };
  }
}

// Función helper para hacer requests a la API de MongoDB
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error(`ERROR 413: El documento es demasiado grande para MongoDB. Reduce el tamaño de las imágenes.`);
      }
      if (response.status === 404) {
        throw new Error(`ERROR 404: Endpoint no encontrado. Verifica las rutas en tu servidor Express.`);
      }
      if (response.status === 500) {
        throw new Error(`ERROR 500: Error interno del servidor. Revisa los logs de tu backend.`);
      }
      throw new Error(`Error HTTP: status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error en solicitud a ${endpoint}:`, error);
    throw error;
  }
}

// Función para crear un producto de prueba en MongoDB
export async function crearProductoPrueba(): Promise<void> {
  try {
    const productoPrueba = {
      name: "Camiseta de Prueba MongoDB",
      category: "casual" as const,
      subcategory: "camiseta",
      brand: "Marca Prueba",
      color: "Rojo",
      material: "Algodón 100%",
      season: "all-season" as const,
      gender: "unisex" as const,
      price: 25000,
      description: "Producto de prueba para verificar MongoDB",
      images: [],
      sizes: ["S", "M", "L"],
      inventory: {
        "S": 5,
        "M": 10,
        "L": 3
      }
    };
    
    const resultado = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productoPrueba),
    });
    
    alert('✅ Producto de prueba creado exitosamente en MongoDB');
    
  } catch (error: any) {
    console.error('Error creando producto de prueba:', error);
    alert(`❌ Error creando producto de prueba: ${error.message}`);
  }
}

export const storage = {
  // Obtener todos los productos
  async getProducts(): Promise<Product[]> {
    try {
      const products = await apiRequest('/products');
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error obteniendo productos de MongoDB:', error);
      return [];
    }
  },

  // Obtener un producto por ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getProducts();
      return products.find(product => product.id === id) || null;
    } catch (error) {
      console.error('Error obteniendo producto por ID:', error);
      return null;
    }
  },

  // Crear un producto con manejo de errores mejorado para MongoDB
  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
    try {
      const diagnostico = await diagnosticarMongoDB();
      if (!diagnostico.conectado) {
        throw new Error(`No se puede conectar con MongoDB: ${diagnostico.mensaje}`);
      }
      
      const productoOptimizado = await optimizarImagenesProducto(product);
      
      const resultado = await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(productoOptimizado),
      });
      
      return resultado;
      
    } catch (error: any) {
      console.error('Error creando producto en MongoDB:', error);
      
      if (error.message.includes('404')) {
        throw new Error('BACKEND NO CONFIGURADO: El endpoint /products no existe. Necesitas crear las rutas en tu servidor Express.');
      }
      
      if (error.message.includes('413')) {
        throw new Error('DOCUMENTO DEMASIADO GRANDE: MongoDB rechazó el documento. Las imágenes son demasiado grandes incluso después de la compresión.');
      }
      
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        throw new Error('SERVIDOR NO ENCONTRADO: No se puede conectar con el servidor. Verifica que tu backend Express esté ejecutándose en puerto 3000.');
      }
      
      throw error;
    }
  },

  // Alias para compatibilidad con tu código existente
  async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
    return this.createProduct(product);
  },

  // Actualizar un producto
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      let updatesOptimizados = { ...updates };
      
      if (updates.images && Array.isArray(updates.images)) {
        const productoTemporal = {
          name: updates.name || '',
          category: updates.category || 'casual',
          subcategory: updates.subcategory || '',
          brand: updates.brand || '',
          color: updates.color || '',
          material: updates.material || '',
          season: updates.season || 'all-season',
          gender: updates.gender || 'unisex',
          team: updates.team || '',
          country: updates.country || '',
          playerType: updates.playerType || 'fan',
          price: updates.price || 0,
          description: updates.description || '',
          images: updates.images,
          sizes: updates.sizes || [],
          inventory: updates.inventory || {}
        };
        
        const productoOptimizado = await optimizarImagenesProducto(productoTemporal as Omit<Product, 'id' | 'created_at'>);
        updatesOptimizados.images = productoOptimizado.images;
      }
      
      const result = await apiRequest(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatesOptimizados),
      });
      
      return result;
      
    } catch (error) {
      console.error('Error actualizando producto en MongoDB:', error);
      throw error;
    }
  },

  // Eliminar un producto
  async deleteProduct(id: string): Promise<boolean> {
    try {
      await apiRequest(`/products/${id}`, {
        method: 'DELETE',
      });
      
      return true;
      
    } catch (error) {
      console.error('Error eliminando producto de MongoDB:', error);
      return false;
    }
  },

  // ========== FUNCIONES DE INVENTARIO ==========
  
  // Actualizar inventario de un producto (cambiar cantidad específica)
  async updateInventoryQuantity(productId: string, size: string, newQuantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        console.error('Producto no encontrado para actualizar inventario');
        return false;
      }

      const newInventory = { ...product.inventory };
      newInventory[size] = Math.max(0, newQuantity);

      const updated = await this.updateProduct(productId, {
        inventory: newInventory
      });

      return updated !== null;
    } catch (error) {
      console.error('Error actualizando cantidad de inventario en MongoDB:', error);
      return false;
    }
  },

  // Incrementar inventario (agregar stock)
  async incrementInventory(productId: string, size: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        console.error('Producto no encontrado para incrementar inventario');
        return false;
      }

      const newInventory = { ...product.inventory };
      const currentStock = newInventory[size] || 0;
      newInventory[size] = currentStock + quantity;

      const updated = await this.updateProduct(productId, {
        inventory: newInventory
      });

      return updated !== null;
    } catch (error) {
      console.error('Error incrementando inventario en MongoDB:', error);
      return false;
    }
  },

  // Decrementar inventario (restar stock, por ejemplo en una venta)
  async decrementInventory(productId: string, size: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        console.error('Producto no encontrado para decrementar inventario');
        return false;
      }

      const newInventory = { ...product.inventory };
      const currentStock = newInventory[size] || 0;
      newInventory[size] = Math.max(0, currentStock - quantity);

      const updated = await this.updateProduct(productId, {
        inventory: newInventory
      });

      return updated !== null;
    } catch (error) {
      console.error('Error decrementando inventario en MongoDB:', error);
      return false;
    }
  },

  // ========== FIN FUNCIONES DE INVENTARIO ==========

  // ========== FUNCIONES DE VENTAS ==========
  
  // Obtener todas las ventas
  async getSales() {
    try {
      const sales = await apiRequest('/sales');
      return Array.isArray(sales) ? sales : [];
    } catch (error) {
      console.error('Error obteniendo ventas de MongoDB:', error);
      return [];
    }
  },

  // Agregar una venta (registrar y actualizar inventario)
  async addSale(saleData: any) {
    try {
      const product = await this.getProductById(saleData.productId);
      if (!product) {
        console.error('Producto no encontrado');
        return null;
      }

      const currentStock = product.inventory[saleData.size] || 0;
      if (currentStock < saleData.quantity) {
        console.error('Stock insuficiente');
        alert(`Stock insuficiente. Solo hay ${currentStock} unidades disponibles.`);
        return null;
      }

      const sale = await apiRequest('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      });

      if (sale) {
        await this.decrementInventory(
          saleData.productId,
          saleData.size,
          saleData.quantity
        );

        return sale;
      }

      return null;
    } catch (error) {
      console.error('Error creando venta en MongoDB:', error);
      return null;
    }
  },

  // Crear una venta (sin actualizar inventario - uso interno)
  async createSale(sale: any) {
    try {
      return await apiRequest('/sales', {
        method: 'POST',
        body: JSON.stringify(sale),
      });
    } catch (error) {
      console.error('Error creando venta en MongoDB:', error);
      return null;
    }
  },

  // Eliminar una venta (y restaurar el inventario)
  async deleteSale(saleId: string) {
    try {
      const sales = await this.getSales();
      const sale = sales.find(s => s.id === saleId);
      
      if (!sale) {
        console.error('Venta no encontrada');
        return false;
      }

      await apiRequest(`/sales/${saleId}`, {
        method: 'DELETE',
      });

      await this.incrementInventory(
        sale.productId,
        sale.size,
        sale.quantity
      );

      return true;
    } catch (error) {
      console.error('Error eliminando venta en MongoDB:', error);
      return false;
    }
  },

  // Verificar si un producto tiene stock (versión async)
  async hasStock(productId: string): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      if (!product) return false;
      
      return Object.values(product.inventory).some(stock => stock > 0);
    } catch (error) {
      console.error('Error verificando stock:', error);
      return false;
    }
  },

  // Obtener stock disponible de un producto y talle específico
  async getAvailableStock(productId: string, size: string): Promise<number> {
    try {
      const product = await this.getProductById(productId);
      if (!product) return 0;
      
      return product.inventory[size] || 0;
    } catch (error) {
      console.error('Error obteniendo stock disponible:', error);
      return 0;
    }
  },

  // ========== FIN FUNCIONES DE VENTAS ==========

  // Actualizar inventario después de una venta
  async updateInventory(productId: string, size: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      if (!product) {
        console.error('Producto no encontrado para actualizar inventario');
        return false;
      }

      const newInventory = { ...product.inventory };
      const currentStock = newInventory[size] || 0;
      newInventory[size] = Math.max(0, currentStock - quantity);

      const updated = await this.updateProduct(productId, {
        inventory: newInventory
      });

      return updated !== null;
    } catch (error) {
      console.error('Error actualizando inventario en MongoDB:', error);
      return false;
    }
  },

  // Función utilitaria para verificar el estado de la API
  async healthCheck(): Promise<boolean> {
    try {
      await apiRequest('/products');
      return true;
    } catch (error) {
      return false;
    }
  },

  // Función para diagnóstico rápido
  async diagnosticoRapido(): Promise<void> {
    const diagnostico = await diagnosticarMongoDB();
    
    if (!diagnostico.conectado) {
      alert(`❌ PROBLEMA DE CONEXIÓN:\n${diagnostico.mensaje}`);
    } else {
      alert(`✅ CONEXIÓN EXITOSA:\n${diagnostico.mensaje}`);
    }
  }
};

// Función para inicializar datos de muestra (vacía para MongoDB)
export async function initializeSampleData(): Promise<void> {
  const diagnostico = await diagnosticarMongoDB();
}

// Utilidades adicionales para el manejo de productos
export const productUtils = {
  // Calcular stock total de un producto
  calcularStockTotal(product: Product): number {
    return Object.values(product.inventory).reduce((total, stock) => total + stock, 0);
  },

  // Verificar si un producto tiene stock
  tieneStock(product: Product): boolean {
    return this.calcularStockTotal(product) > 0;
  },

  // Obtener talles disponibles con stock
  tallesConStock(product: Product): string[] {
    return product.sizes.filter(size => (product.inventory[size] || 0) > 0);
  },

  // Formatear precio
  formatearPrecio(price: number): string {
    return `$${price.toLocaleString('es-AR')}`;
  }
};