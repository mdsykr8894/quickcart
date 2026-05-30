import { api } from './api';
import { ApiResponse, Product, Category } from '../types';

export interface ProductListParams {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const productApi = {
  /**
   * Fetches all product categories.
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  /**
   * Fetches a paginated, filterable product list.
   */
  async getProducts(params: ProductListParams = {}): Promise<ApiResponse<PaginatedProducts>> {
    const response = await api.get<ApiResponse<PaginatedProducts>>('/products', { params });
    return response.data;
  },

  /**
   * Fetches a specific product's details by ID or slug.
   */
  async getProductDetail(idOrSlug: string): Promise<ApiResponse<Product>> {
    const response = await api.get<ApiResponse<Product>>(`/products/${idOrSlug}`);
    return response.data;
  }
};
