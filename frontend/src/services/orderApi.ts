import { api } from './api';
import { ApiResponse, Order, OrderStatus } from '../types';

export interface CheckoutPayload {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface GetMyOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderApi = {
  /**
   * Places a simulated order using the active shopping cart items.
   * Atomically decrements product stock and empties shopper cart.
   */
  async checkout(payload: CheckoutPayload): Promise<ApiResponse<Order>> {
    const response = await api.post<ApiResponse<Order>>('/orders/checkout', payload);
    return response.data;
  },

  /**
   * Retrieves the authenticated customer's paginated order history list.
   */
  async getMyOrders(params: GetMyOrdersParams = {}): Promise<ApiResponse<PaginatedOrders>> {
    const response = await api.get<ApiResponse<PaginatedOrders>>('/orders/my', { params });
    return response.data;
  },

  /**
   * Fetches a specific user order by ID. Enforces ownership to block IDOR attacks.
   */
  async getMyOrderDetail(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get<ApiResponse<Order>>(`/orders/my/${id}`);
    return response.data;
  }
};
