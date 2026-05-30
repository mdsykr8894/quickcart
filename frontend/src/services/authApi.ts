import { api } from './api';
import { ApiResponse, User } from '../types';

export const authApi = {
  /**
   * Registers a new customer profile.
   */
  async register(payload: any): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/auth/register', payload);
    return response.data;
  },

  /**
   * Fetches a fresh CSRF token from the server.
   */
  async getCsrf(): Promise<{ csrfToken: string }> {
    const response = await api.get<{ data: { csrfToken: string } }>('/auth/csrf');
    return response.data.data;
  },

  /**
   * Log in credentials and start HttpOnly session cookie on the client.
   */
  async login(payload: any): Promise<ApiResponse<{ user: User }>> {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', payload);
    return response.data;
  },

  /**
   * Logs out the user and clears the JWT cookie.
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  /**
   * Fetches the current user profile from session data.
   */
  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  /**
   * Fetches the full profile metadata of the shopper.
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  /**
   * Updates core user profile fields (firstName, lastName, email).
   */
  async updateProfile(payload: any): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>('/users/profile', payload);
    return response.data;
  },

  /**
   * Uploads user profile image using multipart/form-data.
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<User>> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.patch<ApiResponse<User>>('/auth/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
