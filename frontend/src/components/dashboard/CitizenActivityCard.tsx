import { useComplaintStats, useMonthlyComplaintStats } from '@/hooks/useComplaints';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

export function CitizenActivityCard() {
  const { data: stats, isLoading } = useComplaintStats();
  const { data: monthlyData } = useMonthlyComplaintStats();

  const currentMonthName = new Date().toLocaleString('en', { month: 'short' });
  const thisMonth = monthlyData?.find((m) => m.month === currentMonthName);
  const reportedThisMonth = thisMonth?.complaints ?? 0;
  const resolved = stats?.resolved ?? 0;
  const total = stats?.total ?? 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-center min-h-[180px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-[#06038D]" />
        <h3 className="font-semibold text-foreground">Your activity</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-2xl font-bold text-[#06038D]">{reportedThisMonth}</p>
          <p className="text-sm text-muted-foreground">Reported this month</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-[#046A38]">{resolutionRate}%</p>
          <p className="text-sm text-muted-foreground">Issues resolved</p>
        </div>
      </div>
      <Link
        to="/complaints"
        className="inline-flex items-center text-sm font-medium text-[#06038D] hover:underline"
      >
        View all your reports
        <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  );
}
