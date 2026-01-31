export type UserRole = 'citizen' | 'officer' | 'department_head' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  ward?: string;
  department?: string;
}

export type ComplaintStatus = 'submitted' | 'in_review' | 'in_progress' | 'resolved' | 'reopened';

export type ComplaintCategory = 
  | 'roads'
  | 'water'
  | 'electricity'
  | 'garbage'
  | 'sewage'
  | 'street_lights'
  | 'parks'
  | 'other';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ComplaintImage {
  id: string;
  url: string;
  type: 'before' | 'after';
  uploadedBy: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  caption?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: Priority;
  location: {
    address: string;
    ward: string;
    wardId?: string;
    zoneId?: string;
    areaId?: string;
    lat: number;
    lng: number;
  };
  images: ComplaintImage[];
  citizenId: string;
  citizenName: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
  comments: Comment[];
  rating?: number;
  feedback?: string;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  message: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface Comment {
  id: string;
  message: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  isInternal: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'status_update' | 'comment' | 'assignment' | 'system';
  read: boolean;
  timestamp: string;
  complaintId?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headId: string;
  headName: string;
  totalComplaints: number;
  resolvedComplaints: number;
  avgResolutionTime: number;
}

export interface Ward {
  id: string;
  name: string;
  zone: string;
  totalComplaints: number;
  activeComplaints: number;
}

export interface PublicDocument {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  uploadedAt: string;
  downloads: number;
}

export interface PublicProject {
  id: string;
  title: string;
  description: string;
  department: string;
  ward: string;
  budget: number;
  progress: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
}
