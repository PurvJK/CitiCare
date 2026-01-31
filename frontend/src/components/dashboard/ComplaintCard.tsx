import { DbComplaint } from '@/hooks/useComplaints';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ComplaintCardProps {
  complaint: DbComplaint;
  showActions?: boolean;
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'Processing',
  on_hold: 'On Hold',
  resolved: 'Resolved',
  rejected: 'Rejected',
  closed: 'Closed',
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

export function ComplaintCard({ complaint, showActions = true }: ComplaintCardProps) {
  const statusVariant = complaint.status.replace('_', '-') as any;

  return (
    <Link
      to={`/complaints/${complaint.id}`}
      className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 animate-fade-in group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{categoryIcons[complaint.category] || '📋'}</span>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground group-hover:text-[#06038D] transition-colors">{complaint.title}</h3>
              <Badge variant={statusVariant} className="text-xs">
                {statusLabels[complaint.status] || complaint.status}
              </Badge>
              {complaint.priority === 'urgent' && (
                <Badge variant="urgent" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {complaint.description}
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#06038D] group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {complaint.address || complaint.wards?.name || 'Location not specified'}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(complaint.created_at).toLocaleDateString()}
        </div>
        <span className="text-xs font-medium text-foreground/60">
          ID: {complaint.complaint_number}
        </span>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs">
            <span className="text-muted-foreground">Department: </span>
            <span className="font-medium">{complaint.departments?.name || 'Unassigned'}</span>
          </div>
        </div>
      )}
    </Link>
  );
}
