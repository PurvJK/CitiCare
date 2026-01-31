import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data } = await api.get<Document[]>('/documents');
      return data;
    },
  });
}
