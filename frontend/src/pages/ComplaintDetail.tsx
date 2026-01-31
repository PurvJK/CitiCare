import { useParams, useNavigate } from 'react-router-dom';
import { useComplaint, useComplaintComments, useAddComment } from '@/hooks/useComplaints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { StaffActionsPanel } from '@/components/complaint/StaffActionsPanel';
import { DepartmentWorkPanel } from '@/components/complaint/DepartmentWorkPanel';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Building2,
  MessageSquare,
  Star,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'Processing',
  on_hold: 'On Hold',
  resolved: 'Solved',
  rejected: 'Rejected',
  closed: 'Closed',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  pending: Clock,
  in_progress: AlertCircle,
  on_hold: Clock,
  resolved: CheckCircle,
  rejected: AlertCircle,
  closed: FileCheck,
};

const categoryIcons: Record<string, string> = {
  roads: '🛣️',
  water: '💧',
  electricity: '⚡',
  garbage: '🗑️',
  sewage: '🚰',
  street_lights: '💡',
  parks: '🌳',
  other: '📋',
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: complaint, isLoading } = useComplaint(id || '');
  const { data: comments, isLoading: commentsLoading } = useComplaintComments(id || '');
  const addComment = useAddComment();

  const handleAddComment = async () => {
    if (!comment.trim() || !id) return;

    try {
      await addComment.mutateAsync({ complaintId: id, content: comment });
      setComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to add comment',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold mb-2">Complaint Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The complaint you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/complaints')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Complaints
        </Button>
      </div>
    );
  }

  const StatusIcon = statusIcons[complaint.status] || Clock;
  const images = complaint.complaint_images || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{categoryIcons[complaint.category] || '📋'}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">{complaint.title}</h1>
                <Badge variant={complaint.status.replace('_', '-') as any}>
                  {statusLabels[complaint.status] || complaint.status}
                </Badge>
                {complaint.priority === 'urgent' && (
                  <Badge variant="urgent">Urgent</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">ID: {complaint.complaint_number}</p>
            </div>
          </div>
          {/* Removed old Update Status button - now using StaffActionsPanel */}
        </div>

        <p className="text-muted-foreground mb-6">{complaint.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{complaint.address || complaint.wards?.name || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Filed On</p>
              <p className="font-medium">
                {new Date(complaint.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Department</p>
              <p className="font-medium">{complaint.departments?.name || 'Unassigned'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Zone / Ward</p>
              <p className="font-medium">
                {complaint.zones?.name || 'N/A'} / {complaint.wards?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Work Panel - officer/department_head when complaint belongs to their department */}
      {user?.role && (user.role === 'officer' || user.role === 'department_head') && user.department_id && complaint.department_id === user.department_id && (
        <DepartmentWorkPanel complaint={complaint} />
      )}
      {/* Staff Actions Panel - Only visible to admins (assign department, officer, etc.) */}
      {user?.role === 'admin' && (
        <StaffActionsPanel complaint={complaint} />
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Attached Photos ({images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(image.url)}
                className="aspect-square rounded-lg overflow-hidden border border-border hover:border-accent transition-colors"
              >
                <img
                  src={image.url}
                  alt={image.caption || 'Complaint image'}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-border shadow-2xl">
            <img
              src={selectedImage}
              alt="Complaint image"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status
        </h2>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'h-12 w-12 rounded-full flex items-center justify-center',
              complaint.status === 'resolved' ? 'bg-success/10 text-success' :
              complaint.status === 'in_progress' ? 'bg-info/10 text-info' :
              complaint.status === 'pending' ? 'bg-warning/10 text-warning' :
              'bg-secondary'
            )}
          >
            <StatusIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-lg">{statusLabels[complaint.status] || complaint.status}</p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(complaint.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments?.length || 0})
        </h2>

        {commentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4 mb-6">
            {comments.map((c) => (
              <div
                key={c.id}
                className={cn(
                  'rounded-lg p-4',
                  c.user_id === user?.id
                    ? 'bg-accent/5 border border-accent/20'
                    : 'bg-secondary/50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">
                      {(c.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.profiles?.full_name || 'User'}</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{c.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">No comments yet. Be the first to comment!</p>
        )}

        {/* Add Comment */}
        <div className="space-y-3">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <Button 
            variant="accent" 
            disabled={!comment.trim() || addComment.isPending}
            onClick={handleAddComment}
          >
            {addComment.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Comment
          </Button>
        </div>
      </div>

      {/* Rating (for resolved complaints) */}
      {complaint.status === 'resolved' && user?.role === 'citizen' && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rate Resolution
          </h2>
          <div>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="p-1">
                  <Star className="h-8 w-8 text-muted-foreground hover:fill-warning hover:text-warning transition-colors" />
                </button>
              ))}
            </div>
            <Textarea placeholder="Share your feedback..." rows={2} className="mb-3" />
            <Button variant="accent">Submit Rating</Button>
          </div>
        </div>
      )}
    </div>
  );
}
