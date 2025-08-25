export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  preferences?: UserPreferences;
}

export type UserRole = 'admin' | 'operator' | 'viewer' | 'guest';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    slack: boolean;
    sms: boolean;
  };
  dashboard: {
    default_view: string;
    refresh_interval: number;
    show_alerts: boolean;
    show_metrics: boolean;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserProfile {
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  preferences?: UserPreferences;
}
