export interface Product {
  id: string;
  name: string;
  category: 'football' | 'casual' | 'formal' | 'sportswear' | 'accessories';
  subcategory: string; // e.g., 'camiseta', 'pantalón', 'zapatos', etc.
  brand?: string;
  color: string;
  material?: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
  gender: 'men' | 'women' | 'unisex' | 'kids';
  // Football specific fields (optional)
  team?: string;
  country?: string;
  playerType?: 'fan' | 'player' | 'jugador';
  price: number;
  images: string[];
  sizes: string[];
  inventory: { [size: string]: number }; // Stock por talle
  description?: string;
  createdAt: string;
}

// Keep Shirt as alias for backward compatibility
export type Shirt = Product;

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'efectivo' | 'transferencia';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  saleDate: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface FilterState {
  category: string;
  subcategory: string;
  brand: string;
  color: string;
  gender: string;
  size: string;
  searchTerm: string;
}