import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  department_id: string | null;
  department_name: string | null;
  role: string;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: string;
  departmentId?: string;
}

export interface UpdateUserData {
  userId: string;
  role?: string;
  departmentId?: string | null;
  fullName?: string;
  phone?: string;
}

export function useUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
    enabled: user?.role === 'admin',
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const { data: result } = await api.post('/users', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
        departmentId: data.departmentId,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await api.patch(`/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, departmentId }: { userId: string; departmentId: string | null }) => {
      await api.patch(`/users/${userId}/department`, { departmentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
