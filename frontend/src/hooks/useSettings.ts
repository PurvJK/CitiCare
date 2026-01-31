import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface SystemSettings {
  auto_assign_complaints: boolean;
  email_confirmations: boolean;
  maintenance_mode: boolean;
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data } = await api.get<SystemSettings>('/settings');
      return data;
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      await api.patch('/settings', { key, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!session?.access_token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await api.post<{ avatar_url: string }>('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.avatar_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      await api.post('/profile/change-password', {
        currentPassword,
        newPassword,
      });
    },
  });
}
