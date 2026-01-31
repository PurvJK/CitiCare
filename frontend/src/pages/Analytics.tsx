import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useComplaintStats } from '@/hooks/useComplaints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintsBarChart, ComplaintsStatusChart } from '@/components/dashboard/ComplaintsChart';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
} from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useComplaintStats();

  // Only staff can access this page
  if (user?.role === 'citizen') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const total = stats?.total || 0;
  const resolved = stats?.resolved || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into complaint management performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats?.total || 0}</span>
              </div>
              <div className="flex items-center text-success text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{resolutionRate}%</span>
              </div>
              <div className="flex items-center text-success text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                <span className="text-2xl font-bold">{stats?.pending || 0}</span>
              </div>
              <div className="flex items-center text-destructive text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>-8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-info" />
                <span className="text-2xl font-bold">3.2d</span>
              </div>
              <div className="flex items-center text-success text-sm">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>-15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ComplaintsBarChart />
        <ComplaintsStatusChart />
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Summary
          </CardTitle>
          <CardDescription>
            Overview of complaint handling across departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Total Resolved</p>
                <p className="text-sm text-muted-foreground">All time</p>
              </div>
              <span className="text-2xl font-bold text-success">{stats?.resolved || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">In Progress</p>
                <p className="text-sm text-muted-foreground">Currently being handled</p>
              </div>
              <span className="text-2xl font-bold text-info">{stats?.in_progress || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Rejected</p>
                <p className="text-sm text-muted-foreground">Invalid or duplicate</p>
              </div>
              <span className="text-2xl font-bold text-destructive">{stats?.rejected || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}