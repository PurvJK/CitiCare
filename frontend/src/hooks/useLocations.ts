import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Zone {
  id: string;
  name: string;
  code: string;
}

export interface Ward {
  id: string;
  zone_id: string;
  name: string;
  code: string;
}

export interface Area {
  id: string;
  ward_id: string;
  name: string;
  code: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
}

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data } = await api.get<Zone[]>('/locations/zones');
      return data;
    },
  });
}

export function useWards(zoneId?: string) {
  return useQuery({
    queryKey: ['wards', zoneId],
    queryFn: async () => {
      const params = zoneId ? { zoneId } : {};
      const { data } = await api.get<Ward[]>('/locations/wards', { params });
      return data;
    },
    enabled: !zoneId || !!zoneId,
  });
}

export function useAreas(wardId?: string) {
  return useQuery({
    queryKey: ['areas', wardId],
    queryFn: async () => {
      const params = wardId ? { wardId } : {};
      const { data } = await api.get<Area[]>('/locations/areas', { params });
      return data;
    },
    enabled: !wardId || !!wardId,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get<Department[]>('/locations/departments');
      return data;
    },
  });
}
