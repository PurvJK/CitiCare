import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at?: string;
}

export function useAdminDepartments() {
  return useQuery({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const { data } = await api.get<AdminDepartment[]>('/departments');
      return data;
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; code: string; description?: string }) => {
      const { data } = await api.post<AdminDepartment>('/departments', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      code,
      description,
    }: {
      id: string;
      name?: string;
      code?: string;
      description?: string | null;
    }) => {
      const { data } = await api.patch<AdminDepartment>(`/departments/${id}`, {
        name,
        code,
        description,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}
