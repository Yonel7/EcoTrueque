import api from './api';

export interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  condition: 'nuevo' | 'como_nuevo' | 'buen_estado' | 'usado';
  owner: {
    _id: string;
    name: string;
    location: string;
    rating?: number;
    totalRatings?: number;
  };
  status: 'disponible' | 'reservado' | 'intercambiado' | 'no_disponible';
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export const getProducts = async (params?: { 
  category?: string; 
  search?: string; 
  featured?: string;
}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getUserProducts = async () => {
  const response = await api.get('/products/user');
  return response.data;
};

export const createProduct = async (data: FormData | any) => {
  const config = data instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  
  const response = await api.post('/products', data, config);
  return response.data;
};

export const updateProduct = async (id: string, data: FormData | Partial<Product>) => {
  const config = data instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
    
  const response = await api.put(`/products/${id}`, data, config);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const toggleProductAvailability = async (id: string, available: boolean) => {
  const response = await api.put(`/products/${id}/availability`, { available });
  return response.data;
};