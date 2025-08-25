import { apiClient } from './api';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants';
import { LoginCredentials, LoginResponse, User } from '../types/user';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const data: LoginResponse = response.data;

      // Store tokens
      this.setTokens(data.access_token, data.refresh_token);
      
      // Store user info
      this.currentUser = data.user;
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local data
      this.clearTokens();
      this.currentUser = null;
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      const newAccessToken = response.data.access_token;
      this.setAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error: any) {
      // If refresh fails, clear tokens and throw error
      this.clearTokens();
      this.currentUser = null;
      throw new Error('Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // If we have a cached user, return it
      if (this.currentUser) {
        if (!this.currentUser) {
          throw new Error('No user found');
        }
        return this.currentUser;
      }

      // Otherwise, fetch from API
      const response = await apiClient.get('/auth/me');
      this.currentUser = response.data;
      if (!this.currentUser) {
        throw new Error('No user found');
      }
      return this.currentUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to get user info');
    }
  }

  async updateProfile(profile: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put('/auth/profile', profile);
      this.currentUser = response.data;
      if (!this.currentUser) {
        throw new Error('No user found');
      }
      return this.currentUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update profile');
    }
  }

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    try {
      await apiClient.put('/auth/change-password', passwordData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to change password');
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, try to refresh
        this.refreshToken().catch(() => {
          this.clearTokens();
        });
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private setAccessToken(accessToken: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  // Utility methods for token management
  getTokenExpiry(): Date | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = this.decodeToken(token);
      if (payload.exp) {
        return new Date(payload.exp * 1000);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    
    return null;
  }

  isTokenExpiringSoon(bufferMinutes: number = 5): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;

    const bufferMs = bufferMinutes * 60 * 1000;
    const now = new Date();
    
    return expiry.getTime() - now.getTime() < bufferMs;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.role || '');
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check if user can perform admin actions
  canPerformAdminAction(): boolean {
    return this.hasAnyRole(['admin', 'operator']);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
