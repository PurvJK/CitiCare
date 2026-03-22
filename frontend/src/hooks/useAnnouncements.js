import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAnnouncements(filters) {
  return useQuery({
    queryKey: ['announcements', filters],
    queryFn: async () => {
      const params = {};

      if (filters?.departmentType && filters.departmentType !== 'all') {
        params.departmentType = filters.departmentType;
      }
      if (filters?.priority && filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      if (filters?.area && filters.area !== 'all') {
        params.area = filters.area;
      }

      const { data } = await api.get('/announcements', { params });
      return data;
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body) => {
      const { data } = await api.post('/announcements', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
