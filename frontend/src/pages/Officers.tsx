import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOfficers, useDepartments } from '@/hooks/useComplaints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Loader2, UserPlus } from 'lucide-react';

export default function Officers() {
  const { user } = useAuth();
  const { data: departments } = useDepartments();
  const departmentId = user?.department_id ?? null;
  const { data: officers, isLoading } = useOfficers(departmentId);

  const departmentName = departments?.find((d) => d.id === user?.department_id)?.name ?? 'your department';

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Officers</h1>
          <p className="text-muted-foreground mt-1">
            To add or edit department staff (email/password for login), use User Management.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Create users with email and password. Set role to Officer or Department Head and assign a department so they can log in with the &quot;Department&quot; option on the login page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/users">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Open User Management
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'department_head' && user.role !== 'officer') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user.department_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Officers</h1>
        <p className="text-muted-foreground">You are not assigned to a department. Contact your administrator.</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" />
          Officers
        </h1>
        <p className="text-muted-foreground mt-1">
          Officers in {departmentName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Officers in your department</CardTitle>
          <CardDescription>
            List of officers assigned to {departmentName}. To add or change officers (email/password), an administrator can use User Management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {officers && officers.length > 0 ? (
            <ul className="space-y-3">
              {officers.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{o.full_name}</p>
                    <p className="text-sm text-muted-foreground">{o.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No officers in this department yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
