import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useComplaintStats, useMonthlyComplaintStats } from '@/hooks/useComplaints';
import { Loader2 } from 'lucide-react';

export function ComplaintsBarChart() {
  const { data: monthlyData, isLoading } = useMonthlyComplaintStats();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Monthly Complaints</h3>
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const chartData = monthlyData || [];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Monthly Complaints</h3>
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="complaints"
                fill="hsl(var(--accent))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No complaint data available
          </div>
        )}
      </div>
    </div>
  );
}

export function ComplaintsStatusChart() {
  const { data: stats, isLoading } = useComplaintStats();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Complaints by Status</h3>
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }
  
  const total = stats?.total || 0;
  
  const statusData = total > 0 ? [
    { name: 'Resolved', value: stats?.resolved || 0, color: 'hsl(142, 76%, 36%)' },
    { name: 'In Progress', value: stats?.in_progress || 0, color: 'hsl(199, 89%, 48%)' },
    { name: 'Pending', value: stats?.pending || 0, color: 'hsl(38, 92%, 50%)' },
    { name: 'Rejected', value: stats?.rejected || 0, color: 'hsl(0, 84%, 60%)' },
    { name: 'Closed', value: stats?.closed || 0, color: 'hsl(220, 9%, 46%)' },
  ].filter(s => s.value > 0) : [];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Complaints by Status</h3>
      <div className="h-64">
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No complaint data available
          </div>
        )}
      </div>
      {statusData.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}