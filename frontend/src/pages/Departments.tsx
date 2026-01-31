import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useDepartments } from '@/hooks/useComplaints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ClipboardList, Loader2 } from 'lucide-react';

export default function Departments() {
  const { user } = useAuth();
  const { data: departments, isLoading } = useDepartments();

  // Only admins can access this page
  if (user?.role !== 'admin' && user?.role !== 'department_head') {
    return <Navigate to="/dashboard" replace />;
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
        <h1 className="text-2xl font-bold text-foreground">Departments</h1>
        <p className="text-muted-foreground">
          Manage municipal departments and their configurations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{departments?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">{departments?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Staff Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              <span className="text-2xl font-bold">--</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments?.map((dept, index) => (
          <Card 
            key={dept.id} 
            className="hover:shadow-elegant transition-all animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary">{dept.code}</Badge>
              </div>
              <CardTitle className="text-lg mt-3">{dept.name}</CardTitle>
              <CardDescription>
                Municipal department - {dept.code}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Department Code</span>
                <span className="font-medium">{dept.code}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No departments found</h3>
          <p className="text-sm text-muted-foreground">
            Departments will appear here once they are configured.
          </p>
        </div>
      )}
    </div>
  );
}