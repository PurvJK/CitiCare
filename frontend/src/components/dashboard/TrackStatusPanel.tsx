import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useComplaints } from '@/hooks/useComplaints';
import { ArrowRight, Clock3, Loader2 } from 'lucide-react';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'Processing',
  on_hold: 'On Hold',
  resolved: 'Resolved',
  rejected: 'Rejected',
  closed: 'Closed',
};

export function TrackStatusPanel() {
  const { data: complaints, isLoading } = useComplaints('date');
  const list = (complaints || []).slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Track Status</h3>
          <p className="text-xs text-muted-foreground">Status of complaints you filed</p>
        </div>
        <Link to="/complaints">
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          No complaints filed yet.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((complaint) => (
            <Link
              key={complaint.id}
              to={`/complaints/${complaint.id}`}
              className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className="line-clamp-1 text-sm font-medium text-foreground">{complaint.title}</p>
                <Badge variant={complaint.status.replace('_', '-') as any} className="shrink-0 text-[11px]">
                  {statusLabels[complaint.status] || complaint.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Updated {new Date(complaint.updated_at).toLocaleDateString()}
                <span className="ml-auto">#{complaint.complaint_number}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
