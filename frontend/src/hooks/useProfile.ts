import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  department_id: string | null;
  department_name?: string | null;
  notification_email: boolean;
  notification_push: boolean;
  notification_status_updates: boolean;
  notification_comments: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['profile', session?.access_token],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/profile');
      return data;
    },
    enabled: !!session?.access_token,
  });
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  notification_email?: boolean;
  notification_push?: boolean;
  notification_status_updates?: boolean;
  notification_comments?: boolean;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!session?.access_token) throw new Error('Not authenticated');
      await api.patch('/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
