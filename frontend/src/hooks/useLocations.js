import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data } = await api.get('/locations/zones');
      return data;
    },
  });
}

export function useWards(zoneId) {
  return useQuery({
    queryKey: ['wards', zoneId],
    queryFn: async () => {
      const params = zoneId ? { zoneId } : {};
      const { data } = await api.get('/locations/wards', { params });
      return data;
    },
    enabled: !zoneId || !!zoneId,
  });
}

export function useAreas(wardId) {
  return useQuery({
    queryKey: ['areas', wardId],
    queryFn: async () => {
      const params = wardId ? { wardId } : {};
      const { data } = await api.get('/locations/areas', { params });
      return data;
    },
    enabled: !wardId || !!wardId,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/locations/departments');
      return data;
    },
  });
}
