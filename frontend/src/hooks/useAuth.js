import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';
import { useNavigate } from 'react-router-dom';

// ========== QUERY KEYS ==========
export const authKeys = {
  me: ['auth', 'me'],
};

// ========== HOOKS ==========

// Get current user
export const useGetMe = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.getMe().then(res => res.data.data),
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });
};

// Login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials) => authApi.login(credentials).then(res => res.data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      queryClient.setQueryData(authKeys.me, data.data.user);
      navigate('/');
    },
  });
};

// Register
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userData) => authApi.register(userData).then(res => res.data),
    onSuccess: (data) => {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      queryClient.setQueryData(authKeys.me, data.data.user);
      navigate('/');
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout().then(res => res.data),
    onSuccess: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
      navigate('/login');
    },
  });
};

// Forgot Password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => authApi.forgotPassword(email).then(res => res.data),
  });
};

// Reset Password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }) =>
      authApi.resetPassword(token, password).then(res => res.data),
  });
};

// Update Password
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data) => authApi.updatePassword(data).then(res => res.data),
  });
};