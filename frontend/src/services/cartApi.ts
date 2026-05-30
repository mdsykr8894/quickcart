import { api } from './api';
import { ApiResponse, Cart } from '../types';

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export const cartApi = {
  /**
   * Retrieves the authenticated customer's shopping cart details,
   * complete with subtotals, overall sums, and total items counts.
   */
  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await api.get<ApiResponse<Cart>>('/cart');
    return response.data;
  },

  /**
   * Appends or increments a product inside the shopping cart.
   */
  async addCartItem(payload: AddCartItemPayload): Promise<ApiResponse<Cart>> {
    const response = await api.post<ApiResponse<Cart>>('/cart/items', payload);
    return response.data;
  },

  /**
   * Modifies the quantity parameter of a specific cart item row.
   * Enforces direct ownership check inside the backend database.
   */
  async updateCartItem(id: string, payload: UpdateCartItemPayload): Promise<ApiResponse<Cart>> {
    const response = await api.patch<ApiResponse<Cart>>(`/cart/items/${id}`, payload);
    return response.data;
  },

  /**
   * Removes a specific item from the shopping cart by ID.
   */
  async removeCartItem(id: string): Promise<ApiResponse<Cart>> {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${id}`);
    return response.data;
  },

  /**
   * Completely empties the authenticated shopper's cart.
   */
  async clearCart(): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>('/cart/clear');
    return response.data;
  }
};
