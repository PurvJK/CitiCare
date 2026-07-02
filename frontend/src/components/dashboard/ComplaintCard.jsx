import { useToggleUpvote } from '@/hooks/useComplaints';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ArrowRight, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SlaBadge } from '../complaint/SlaBadge';

const statusLabels = {
    pending: 'Pending',
    in_progress: 'Processing',
    on_hold: 'On Hold',
    resolved: 'Resolved',
    rejected: 'Rejected',
    closed: 'Closed',
};
const categoryIcons = {
    roads: '🛣️',
    water: '💧',
    electricity: '⚡',
    garbage: '🗑️',
    sewage: '🚰',
    street_lights: '💡',
    parks: '🌳',
    other: '📋',
};
export function ComplaintCard({ complaint, showActions = true }) {
    const statusVariant = complaint.status.replace('_', '-');
    const { user } = useAuth();
    const toggle = useToggleUpvote();
    return (<Link to={`/complaints/${complaint.id}`} className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 animate-fade-in group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{categoryIcons[complaint.category] || '📋'}</span>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground group-hover:text-[#06038D] transition-colors">{complaint.title}</h3>
              <Badge variant={statusVariant} className="text-xs">
                {statusLabels[complaint.status] || complaint.status}
              </Badge>
              {complaint.priority === 'urgent' && (<Badge variant="urgent" className="text-xs">
                  Urgent
                </Badge>)}
              <SlaBadge complaint={complaint} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {complaint.description}
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#06038D] group-hover:translate-x-0.5 transition-all shrink-0"/>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5"/>
          {complaint.address || complaint.wards?.name || 'Location not specified'}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5"/>
          {new Date(complaint.created_at).toLocaleDateString()}
        </div>
        <span className="text-xs font-medium text-foreground/60">
          ID: {complaint.complaint_number}
        </span>
      </div>

      {showActions && (<div className="mt-4 pt-4 border-t border-border space-y-2">
          {user?.role === 'admin' && complaint.profiles?.full_name ? (<div className="text-xs">
              <span className="text-muted-foreground">Submitted By: </span>
              <span className="font-medium">{complaint.profiles.full_name}</span>
            </div>) : null}
          <div className="text-xs">
            <span className="text-muted-foreground">Department: </span>
            <span className="font-medium">{complaint.departments?.name || 'Unassigned'}</span>
          </div>
          {complaint.assigned_officer ? (<div className="text-xs">
              <span className="text-muted-foreground">Assigned Officer: </span>
              <span className="font-medium">{complaint.assigned_officer.full_name}</span>
            </div>) : null}
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="text-muted-foreground">Upvotes: </span>
              <span className="font-medium">{complaint.upvotes ?? 0}</span>
            </div>
            {user?.role === 'citizen' && (<button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!toggle.isLoading)
                        toggle.mutate(complaint.id);
                }} className={`inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium transition-colors ${complaint.upvoted_by_user ? 'text-primary' : 'text-muted-foreground'}`} aria-pressed={!!complaint.upvoted_by_user}>
                <ThumbsUp className="h-4 w-4"/>
                {complaint.upvoted_by_user ? 'Upvoted' : 'Upvote'}
              </button>)}
          </div>
        </div>)}
    </Link>);
}
