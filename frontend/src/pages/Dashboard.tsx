import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentComplaints } from '@/components/dashboard/RecentComplaints';
import { ComplaintsBarChart, ComplaintsStatusChart } from '@/components/dashboard/ComplaintsChart';
import { DashboardSlider } from '@/components/dashboard/DashboardSlider';
import { DashboardUserGuide } from '@/components/dashboard/DashboardUserGuide';
import { CitizenQuickActions } from '@/components/dashboard/CitizenQuickActions';
import { CitizenActivityCard } from '@/components/dashboard/CitizenActivityCard';
import { CitizenTips } from '@/components/dashboard/CitizenTips';
import { useComplaintStats } from '@/hooks/useComplaints';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/* Hero background – image from public folder (served at root) */
const heroBgImage = '/city.jpg';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function CitizenDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useComplaintStats();
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#06038D]" />
        <p className="text-muted-foreground font-medium">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      <section className="relative rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden min-h-[260px] md:min-h-[320px]">
        {/* Background image – separate layer so it always shows */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroBgImage})`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <p className="text-white/90 text-sm font-medium mb-1">
            {getGreeting()}
          </p>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Hi, {firstName}
          </h1>

          <p className="text-white/90 max-w-xl mb-6">
            Report civic issues, track status, and see what’s happening in your area.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/complaints/new">
              <Button
                size="lg"
                className="bg-[#FF671F] hover:bg-[#e55a15] text-white shadow-md"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Report an issue
              </Button>
            </Link>

            <Link to="/complaints">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Track my issues
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Quick actions – interactive cards */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">What do you want to do?</h2>
        <CitizenQuickActions />
      </section>

      {/* Your reports – clickable stats */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1">Your reports</h2>
        <p className="text-sm text-muted-foreground mb-4">Tap a card to see those issues.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total reported"
            value={stats?.total || 0}
            icon={FileText}
            iconColor="bg-primary/10 text-primary"
            href="/complaints"
          />
          <StatCard
            title="Awaiting action"
            value={stats?.pending || 0}
            icon={Clock}
            iconColor="bg-warning/10 text-warning"
            href="/complaints?status=pending"
          />
          <StatCard
            title="In progress"
            value={stats?.in_progress || 0}
            icon={AlertTriangle}
            iconColor="bg-info/10 text-info"
            href="/complaints?status=in_progress"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle}
            iconColor="bg-success/10 text-success"
            href="/complaints?status=resolved"
          />
        </div>
      </section>

      {/* What’s happening in your area – slider + guide */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-1">What’s happening in your area</h2>
        <p className="text-sm text-muted-foreground mb-4">Civic work and how you can get help.</p>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 min-h-[260px]">
          <div className="min-h-[220px] lg:col-span-7 lg:min-h-0">
            <DashboardSlider />
          </div>
          <div className="w-full min-h-[240px] lg:col-span-3 lg:min-h-[260px]">
            <DashboardUserGuide />
          </div>
        </div>
      </section>

      {/* Activity + Your latest reports + Tips */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <CitizenActivityCard />
          <CitizenTips />
        </div>
        <div className="lg:col-span-2">
          <RecentComplaints title="Your latest reports" />
        </div>
      </section>
    </div>
  );
}

function OfficerDashboard() {
  const { data: stats, isLoading } = useComplaintStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#06038D]">Officer Dashboard</h1>
        <p className="text-muted-foreground font-medium">
          Manage assigned complaints and update status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 min-h-[260px]">
        <div className="min-h-[220px] lg:col-span-7 lg:min-h-0">
          <DashboardSlider />
        </div>
        <div className="w-full min-h-[240px] lg:col-span-3 lg:min-h-[260px]">
          <DashboardUserGuide />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#06038D] mb-3">Complaint Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats?.total || 0}
            icon={FileText}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Pending"
            value={stats?.pending || 0}
            icon={Clock}
            iconColor="bg-warning/10 text-warning"
          />
          <StatCard
            title="In Progress"
            value={stats?.in_progress || 0}
            icon={AlertTriangle}
            iconColor="bg-info/10 text-info"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle}
            iconColor="bg-success/10 text-success"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ComplaintsBarChart />
        <ComplaintsStatusChart />
      </div>

      <RecentComplaints />
    </div>
  );
}

function DepartmentHeadDashboard() {
  const { data: stats, isLoading } = useComplaintStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#06038D]">Department Dashboard</h1>
        <p className="text-muted-foreground font-medium">
          Department Performance Overview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 min-h-[260px]">
        <div className="min-h-[220px] lg:col-span-7 lg:min-h-0">
          <DashboardSlider />
        </div>
        <div className="w-full min-h-[240px] lg:col-span-3 lg:min-h-[260px]">
          <DashboardUserGuide />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#06038D] mb-3">Complaint Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats?.total || 0}
            icon={FileText}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Pending"
            value={stats?.pending || 0}
            icon={Clock}
            iconColor="bg-warning/10 text-warning"
          />
          <StatCard
            title="In Progress"
            value={stats?.in_progress || 0}
            icon={AlertTriangle}
            iconColor="bg-info/10 text-info"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle}
            iconColor="bg-success/10 text-success"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ComplaintsBarChart />
        <ComplaintsStatusChart />
      </div>

      <RecentComplaints />
    </div>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading } = useComplaintStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#06038D]">Admin Dashboard</h1>
        <p className="text-muted-foreground font-medium">
          City-wide civic services overview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 min-h-[260px]">
        <div className="min-h-[220px] lg:col-span-7 lg:min-h-0">
          <DashboardSlider />
        </div>
        <div className="w-full min-h-[240px] lg:col-span-3 lg:min-h-[260px]">
          <DashboardUserGuide />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#06038D] mb-3">Complaint Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats?.total || 0}
            icon={FileText}
            iconColor="bg-primary/10 text-primary"
          />
          <StatCard
            title="Pending"
            value={stats?.pending || 0}
            icon={Clock}
            iconColor="bg-warning/10 text-warning"
          />
          <StatCard
            title="In Progress"
            value={stats?.in_progress || 0}
            icon={AlertTriangle}
            iconColor="bg-info/10 text-info"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle}
            iconColor="bg-success/10 text-success"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ComplaintsBarChart />
        <ComplaintsStatusChart />
      </div>

      <RecentComplaints />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'officer':
      return <OfficerDashboard />;
    case 'department_head':
      return <DepartmentHeadDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <CitizenDashboard />;
  }
}
