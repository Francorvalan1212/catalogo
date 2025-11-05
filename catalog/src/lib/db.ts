// db.ts - Adaptador para MongoDB (compatible con sintaxis Supabase)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class DatabaseClient {
  private baseUrl: string;

  constructor(url: string) {
    this.baseUrl = url;
  }

  from(table: string) {
    return new QueryBuilder(this.baseUrl, table);
  }
}

class QueryBuilder {
  private baseUrl: string;
  private table: string;
  private selectFields: string = '*';
  private filters: Array<{ field: string; operator: string; value: any }> = [];
  private orderByField: string | null = null;
  private orderDirection: 'asc' | 'desc' = 'asc';
  private limitValue: number | null = null;

  constructor(baseUrl: string, table: string) {
    this.baseUrl = baseUrl;
    this.table = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, operator: 'eq', value });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ field, operator: 'neq', value });
    return this;
  }

  gt(field: string, value: any) {
    this.filters.push({ field, operator: 'gt', value });
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push({ field, operator: 'gte', value });
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push({ field, operator: 'lt', value });
    return this;
  }

  lte(field: string, value: any) {
    this.filters.push({ field, operator: 'lte', value });
    return this;
  }

  like(field: string, value: string) {
    this.filters.push({ field, operator: 'like', value });
    return this;
  }

  ilike(field: string, value: string) {
    this.filters.push({ field, operator: 'ilike', value });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({ field, operator: 'in', value: values });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderByField = field;
    this.orderDirection = options?.ascending === false ? 'desc' : 'asc';
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  private buildQueryParams() {
    const params = new URLSearchParams();
    
    if (this.selectFields !== '*') {
      params.append('select', this.selectFields);
    }
    
    this.filters.forEach((filter) => {
      params.append(`${filter.field}[${filter.operator}]`, 
        Array.isArray(filter.value) ? filter.value.join(',') : filter.value);
    });
    
    if (this.orderByField) {
      params.append('order', `${this.orderByField}.${this.orderDirection}`);
    }
    
    if (this.limitValue) {
      params.append('limit', this.limitValue.toString());
    }
    
    return params.toString();
  }

  async then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    try {
      const queryString = this.buildQueryParams();
      const url = `${this.baseUrl}/${this.table}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        const result = { data: null, error };
        return reject ? reject(result) : resolve(result);
      }
      
      const data = await response.json();
      const result = { data, error: null };
      return resolve(result);
    } catch (error) {
      const result = { data: null, error };
      return reject ? reject(result) : resolve(result);
    }
  }

  async insert(data: any | any[]) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }
      
      const responseData = await response.json();
      return { data: responseData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async update(data: any) {
    try {
      const queryString = this.buildQueryParams();
      const url = `${this.baseUrl}/${this.table}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }
      
      const responseData = await response.json();
      return { data: responseData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async delete() {
    try {
      const queryString = this.buildQueryParams();
      const url = `${this.baseUrl}/${this.table}${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { data: null, error };
      }
      
      const responseData = await response.json();
      return { data: responseData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Método single para obtener un solo registro
  single() {
    this.limitValue = 1;
    return {
      then: async (resolve: (value: any) => void, reject?: (reason: any) => void) => {
        try {
          const queryString = this.buildQueryParams();
          const url = `${this.baseUrl}/${this.table}${queryString ? '?' + queryString : ''}`;
          
          const response = await fetch(url);
          
          if (!response.ok) {
            const error = await response.json();
            const result = { data: null, error };
            return reject ? reject(result) : resolve(result);
          }
          
          const data = await response.json();
          const result = { data: data[0] || null, error: null };
          return resolve(result);
        } catch (error) {
          const result = { data: null, error };
          return reject ? reject(result) : resolve(result);
        }
      }
    };
  }
}

// Exportar el cliente con la misma interfaz que Supabase
export const supabase = new DatabaseClient(API_URL);

// Tipos de base de datos (mantener igual)
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          subcategory: string;
          brand: string | null;
          color: string;
          material: string | null;
          season: string | null;
          gender: string;
          team: string | null;
          country: string | null;
          player_type: string | null;
          price: number;
          images: string[];
          sizes: string[];
          inventory: Record<string, number>;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          subcategory: string;
          brand?: string | null;
          color: string;
          material?: string | null;
          season?: string | null;
          gender: string;
          team?: string | null;
          country?: string | null;
          player_type?: string | null;
          price: number;
          images: string[];
          sizes: string[];
          inventory: Record<string, number>;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          subcategory?: string;
          brand?: string | null;
          color?: string;
          material?: string | null;
          season?: string | null;
          gender?: string;
          team?: string | null;
          country?: string | null;
          player_type?: string | null;
          price?: number;
          images?: string[];
          sizes?: string[];
          inventory?: Record<string, number>;
          description?: string | null;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          product_id: string;
          product_name: string;
          size: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          payment_method: string;
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          notes: string | null;
          sale_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          product_name: string;
          size: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          payment_method: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          notes?: string | null;
          sale_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          product_name?: string;
          size?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          payment_method?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          notes?: string | null;
          sale_date?: string;
          created_at?: string;
        };
      };
    };
  };
}