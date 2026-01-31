import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface DbComplaint {
  id: string;
  complaint_number: string;
  user_id: string | null;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'on_hold' | 'resolved' | 'rejected' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department_id: string | null;
  assigned_to: string | null;
  zone_id: string | null;
  ward_id: string | null;
  area_id: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  departments?: { name: string } | null;
  zones?: { name: string } | null;
  wards?: { name: string } | null;
  areas?: { name: string } | null;
  profiles?: { full_name: string } | null;
  complaint_images?: { id: string; url: string; caption: string | null; type?: 'before' | 'after' | 'general' }[];
  accepted_by_department?: boolean | null;
  accepted_at?: string | null;
  cost_estimated_amount?: number | null;
  cost_materials?: string | null;
  cost_labor?: string | null;
  cost_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  cost_submitted_at?: string | null;
  completion_remarks?: string | null;
  completed_at?: string | null;
}

export function useComplaints(sortBy?: 'date' | 'priority' | 'area') {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['complaints', user?.id, sortBy],
    queryFn: async () => {
      const params = sortBy ? { sort: sortBy } : {};
      const { data } = await api.get<DbComplaint[]>('/complaints', { params });
      return data;
    },
    enabled: !!session,
  });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const { data } = await api.get<DbComplaint | null>(`/complaints/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

interface CreateComplaintData {
  title: string;
  description: string;
  category: string;
  address: string;
  zone_id?: string;
  ward_id?: string;
  area_id?: string;
  department_id?: string;
  images?: File[];
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateComplaintData) => {
      if (!session?.access_token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('address', data.address || '');
      if (data.zone_id) formData.append('zone_id', data.zone_id);
      if (data.ward_id) formData.append('ward_id', data.ward_id);
      if (data.area_id) formData.append('area_id', data.area_id);
      if (data.department_id) formData.append('department_id', data.department_id);
      if (data.images?.length) {
        data.images.forEach((f) => formData.append('images', f));
      }

      const { data: complaint } = await api.post<DbComplaint>('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return complaint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useComplaintStats() {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['complaint-stats', user?.id],
    queryFn: async () => {
      const { data } = await api.get<{
        total: number;
        pending: number;
        in_progress: number;
        on_hold?: number;
        resolved: number;
        rejected: number;
        closed: number;
      }>('/complaints/stats');
      return data;
    },
    enabled: !!session,
  });
}

export function useMonthlyComplaintStats() {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['monthly-complaint-stats', user?.id],
    queryFn: async () => {
      const { data } = await api.get<{ month: string; complaints: number }[]>('/complaints/monthly');
      return data;
    },
    enabled: !!session,
  });
}

export interface DbComment {
  id: string;
  complaint_id: string;
  user_id: string | null;
  content: string;
  is_internal: boolean;
  created_at: string;
  profiles?: { full_name: string } | null;
}

export function useComplaintComments(complaintId: string) {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['complaint-comments', complaintId],
    queryFn: async () => {
      const { data } = await api.get<DbComment[]>(`/complaints/${complaintId}/comments`);
      return data;
    },
    enabled: !!complaintId && !!session,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ complaintId, content }: { complaintId: string; content: string }) => {
      if (!session?.access_token) throw new Error('Not authenticated');
      const { data } = await api.post<DbComment>(`/complaints/${complaintId}/comments`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint-comments', variables.complaintId] });
    },
  });
}

interface UpdateComplaintData {
  status?: 'pending' | 'in_progress' | 'on_hold' | 'resolved' | 'rejected' | 'closed';
  department_id?: string | null;
  assigned_to?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  accepted_by_department?: boolean;
  cost_estimated_amount?: number | null;
  cost_materials?: string | null;
  cost_labor?: string | null;
  cost_status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  completion_remarks?: string | null;
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, oldStatus, ...data }: UpdateComplaintData & { id: string; oldStatus?: string }) => {
      const { data: result } = await api.patch<DbComplaint>(`/complaints/${id}`, data);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', data.id] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
    },
  });
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/complaints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint-stats'] });
    },
  });
}

export function useUploadComplaintImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintId,
      images,
      type,
    }: {
      complaintId: string;
      images: File[];
      type: 'before' | 'after' | 'general';
    }) => {
      const formData = new FormData();
      images.forEach((f) => formData.append('images', f));
      formData.append('type', type);
      const { data } = await api.post<DbComplaint>(`/complaints/${complaintId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', data.id] });
    },
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; name: string; code: string }[]>('/complaints/meta/departments');
      return data;
    },
  });
}

export interface Officer {
  id: string;
  full_name: string;
  email: string;
  department_id: string | null;
}

export function useOfficers(departmentId?: string | null) {
  return useQuery({
    queryKey: ['officers', departmentId],
    queryFn: async () => {
      const params = departmentId ? { departmentId } : {};
      const { data } = await api.get<Officer[]>('/complaints/meta/officers', { params });
      return data;
    },
  });
}
