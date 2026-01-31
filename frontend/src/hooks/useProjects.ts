import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  department_id: string | null;
  department_name?: string | null;
  ward_id: string | null;
  ward_name?: string | null;
  budget: number;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  created_at: string;
  updated_at: string;
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get<Project[]>('/projects');
      return data;
    },
  });
}
