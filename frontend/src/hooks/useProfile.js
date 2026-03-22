import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['profile', session?.access_token],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data;
    },
    enabled: !!session?.access_token,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (data) => {
      if (!session?.access_token) throw new Error('Not authenticated');
      await api.patch('/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
