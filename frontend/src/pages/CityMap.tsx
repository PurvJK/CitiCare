import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useComplaints } from '@/hooks/useComplaints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  in_progress: 'bg-info/20 text-info border-info/30',
  resolved: 'bg-success/20 text-success border-success/30',
  rejected: 'bg-destructive/20 text-destructive border-destructive/30',
  closed: 'bg-muted text-muted-foreground border-muted',
};

export default function CityMap() {
  const { user } = useAuth();
  const { data: complaints, isLoading } = useComplaints();

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

  // Group complaints by location
  const complaintsWithLocation = complaints?.filter(c => c.latitude && c.longitude) || [];
  const statusCounts = (complaints || []).reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">City Map</h1>
        <p className="text-muted-foreground">
          Geographic view of complaints across the city
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts['pending'] || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts['in_progress'] || 0}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts['resolved'] || 0}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{complaintsWithLocation.length}</p>
                <p className="text-sm text-muted-foreground">With Location</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Complaints Map</CardTitle>
          <CardDescription>
            Interactive map showing complaint locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg bg-muted/50 flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Map View</h3>
              <p className="text-muted-foreground max-w-md">
                Interactive map integration coming soon. This will show complaint 
                locations with color-coded markers based on status.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List with Location */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints with Location Data</CardTitle>
          <CardDescription>
            {complaintsWithLocation.length} complaints have geographic coordinates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complaintsWithLocation.slice(0, 10).map((complaint) => (
              <div 
                key={complaint.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{complaint.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {complaint.address || 'No address'}
                    </p>
                  </div>
                </div>
                <Badge className={statusColors[complaint.status]} variant="outline">
                  {complaint.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
            {complaintsWithLocation.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No complaints with location data yet
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}