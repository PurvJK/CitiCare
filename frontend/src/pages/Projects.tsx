import { useProjects } from '@/hooks/useProjects';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, Building2, IndianRupee, Loader2, HardHat } from 'lucide-react';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info' | 'destructive'> = {
  planned: 'warning',
  in_progress: 'info',
  completed: 'success',
  delayed: 'destructive',
};

const statusLabels: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  delayed: 'Delayed',
};

export default function Projects() {
  const { data: projects, isLoading } = useProjects();

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
        <h1 className="text-2xl font-bold">Public Works & Projects</h1>
        <p className="text-muted-foreground">
          Track ongoing infrastructure and development projects in your city.
        </p>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold">{project.title}</h2>
                    <Badge variant={statusColors[project.status] as any}>
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.description || 'No description'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-medium">{project.department_name || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Ward</p>
                    <p className="font-medium">{project.ward_name || 'All Wards'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">
                      ₹{(project.budget / 10000000).toFixed(1)} Cr
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Timeline</p>
                    <p className="font-medium">
                      {project.start_date && project.end_date 
                        ? `${new Date(project.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - ${new Date(project.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
                        : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <HardHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No projects found</h3>
          <p className="text-sm text-muted-foreground">
            Public works projects will appear here once they are added.
          </p>
        </div>
      )}
    </div>
  );
}