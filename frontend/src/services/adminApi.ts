import { api } from './api';
import { ApiResponse, Product, Category, Order, OrderStatus, User, AuditLog, AuditSummary, AppSettings } from '../types';
export type { AuditSummary };

export interface AdminProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  isActive?: boolean;
}

export interface AdminOrderListParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedAdminOrders {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogParams {
  action?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adminApi = {
  // -------------------------------------------------------------
  // Product Administrative Methods
  // -------------------------------------------------------------
  
  /**
   * Fetches products list including soft-deleted ones for administrative management.
   */
  async getAdminProducts(params: any = {}): Promise<ApiResponse<any>> {
    // Reuses public product endpoint but passes administrative parameters if needed
    const response = await api.get<ApiResponse<any>>('/products', { params });
    return response.data;
  },

  /**
   * Appends a new product into the catalog.
   */
  async createProduct(payload: AdminProductPayload): Promise<ApiResponse<Product>> {
    const response = await api.post<ApiResponse<Product>>('/products', payload);
    return response.data;
  },

  /**
   * Modifies an existing catalog product record.
   */
  async updateProduct(id: string, payload: Partial<AdminProductPayload>): Promise<ApiResponse<Product>> {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}`, payload);
    return response.data;
  },

  /**
   * Soft-deletes a catalog product by toggling isActive to false.
   */
  async deleteProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await api.delete<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  /**
   * Uploads and binds a product image file using multipart/form-data.
   */
  async uploadProductImage(id: string, file: File): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    formData.append('image', file); // strictly uses field name 'image'

    const response = await api.post<ApiResponse<Product>>(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Uploads and binds multiple product image files using multipart/form-data.
   */
  async uploadProductImages(id: string, files: File[]): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file); // strictly uses field name 'images'
    });

    const response = await api.post<ApiResponse<Product>>(`/products/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Deletes a specific product image.
   */
  async deleteProductImage(productId: string, imageId: string): Promise<ApiResponse<Product>> {
    const response = await api.delete<ApiResponse<Product>>(`/products/${productId}/images/${imageId}`);
    return response.data;
  },

  // Namespaced product methods for backwards compatibility and standard patterns
  products: {
    deleteProductImage(productId: string, imageId: string): Promise<ApiResponse<Product>> {
      return adminApi.deleteProductImage(productId, imageId);
    }
  },

  // -------------------------------------------------------------
  // Category Methods
  // -------------------------------------------------------------
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  // -------------------------------------------------------------
  // Order Administrative Methods
  // -------------------------------------------------------------
  
  /**
   * Lists all checkout transactions in the database with status filters and paging.
   */
  async getAdminOrders(params: AdminOrderListParams = {}): Promise<ApiResponse<PaginatedAdminOrders>> {
    const response = await api.get<ApiResponse<PaginatedAdminOrders>>('/orders', { params });
    return response.data;
  },

  /**
   * Fetches any checkout order by ID.
   */
  async getAdminOrderDetail(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  /**
   * Modifies the status of a specific order transaction.
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },

  // -------------------------------------------------------------
  // User Administrative Methods
  // -------------------------------------------------------------
  
  /**
   * Queries registered shoppers list in the database.
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data;
  },

  /**
   * Inspects detailed profiles of any shopper by ID.
   */
  async getUserDetail(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // -------------------------------------------------------------
  // Security Audit Log Methods
  // -------------------------------------------------------------
  
  /**
   * Queries paginated operational security logs.
   */
  async getAuditLogs(params: AuditLogParams = {}): Promise<ApiResponse<PaginatedAuditLogs>> {
    const response = await api.get<ApiResponse<PaginatedAuditLogs>>('/audit/logs', { params });
    return response.data;
  },

  /**
   * Queries cumulative log count statistics.
   */
  async getAuditSummary(): Promise<ApiResponse<AuditSummary>> {
    const response = await api.get<ApiResponse<AuditSummary>>('/audit/summary');
    return response.data;
  },

  // -------------------------------------------------------------
  // System Configurations / Settings Methods
  // -------------------------------------------------------------

  /**
   * Fetches global development system configurations.
   */
  async getSettings(): Promise<ApiResponse<AppSettings>> {
    const response = await api.get<ApiResponse<AppSettings>>('/settings');
    return response.data;
  },

  /**
   * Toggles development Swagger documentation visibility.
   */
  async updateSwaggerSetting(swaggerEnabled: boolean): Promise<ApiResponse<AppSettings>> {
    const response = await api.patch<ApiResponse<AppSettings>>('/settings/swagger', { swaggerEnabled });
    return response.data;
  }
};
