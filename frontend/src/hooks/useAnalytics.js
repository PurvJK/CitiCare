import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAdminDepartmentOverview(enabled) {
  return useQuery({
    queryKey: ['admin-department-overview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/department-overview');
      return data;
    },
    enabled,
  });
}
