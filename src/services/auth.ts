import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  phone?: string;
  rating?: number;
  totalRatings?: number;
  avatar?: string;
  token: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  location?: string;
  bio?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface SocialAuthData {
  googleToken?: string;
  facebookToken?: string;
  name: string;
  email: string;
  picture?: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const googleAuth = async (data: SocialAuthData): Promise<AuthResponse> => {
  const response = await api.post('/auth/google', data);
  return response.data;
};

export const facebookAuth = async (data: SocialAuthData): Promise<AuthResponse> => {
  const response = await api.post('/auth/facebook', data);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const updateProfile = async (data: UpdateProfileData): Promise<AuthResponse> => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const updateAvatar = async (file: File): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.put('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};