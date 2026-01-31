import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUpdateComplaint, useDeleteComplaint, useDepartments, useOfficers, DbComplaint } from '@/hooks/useComplaints';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Building2, AlertTriangle, UserCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StaffActionsPanelProps {
  complaint: DbComplaint;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'Processing' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function StaffActionsPanel({ complaint }: StaffActionsPanelProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const updateComplaint = useUpdateComplaint();
  const deleteComplaint = useDeleteComplaint();
  const { data: departments } = useDepartments();

  const [status, setStatus] = useState(complaint.status);
  const [departmentId, setDepartmentId] = useState(complaint.department_id || '');
  const [assignedTo, setAssignedTo] = useState(complaint.assigned_to || '');
  const [priority, setPriority] = useState(complaint.priority);

  // Fetch officers - filter by selected department if one is chosen
  const { data: officers } = useOfficers(departmentId || null);

  // Only department heads and admins can assign officers
  const isAdmin = user?.role === 'admin';
  const canAssignOfficer = user?.role === 'admin' || user?.role === 'department_head';

  const hasChanges =
    status !== complaint.status ||
    departmentId !== (complaint.department_id || '') ||
    assignedTo !== (complaint.assigned_to || '') ||
    priority !== complaint.priority;

  const handleUpdate = async () => {
    try {
      await updateComplaint.mutateAsync({
        id: complaint.id,
        oldStatus: complaint.status, // Pass old status for email notification
        status,
        department_id: departmentId || null,
        assigned_to: assignedTo || null,
        priority,
      });
      toast({
        title: 'Complaint updated',
        description: status !== complaint.status 
          ? 'The complaint has been updated and the user has been notified.'
          : 'The complaint has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComplaint.mutateAsync(complaint.id);
      toast({
        title: 'Complaint deleted',
        description: 'The complaint has been permanently deleted.',
      });
      navigate('/complaints');
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Staff Actions
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="status" className="flex items-center gap-1">
            Status
          </Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            Department
          </Label>
          <Select value={departmentId || 'unassigned'} onValueChange={(val) => setDepartmentId(val === 'unassigned' ? '' : val)}>
            <SelectTrigger id="department">
              <SelectValue placeholder="Assign department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Priority
          </Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Set priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canAssignOfficer && (
          <div className="space-y-2">
            <Label htmlFor="officer" className="flex items-center gap-1">
              <UserCheck className="h-4 w-4" />
              Assign Officer
            </Label>
            <Select value={assignedTo || 'unassigned'} onValueChange={(val) => setAssignedTo(val === 'unassigned' ? '' : val)}>
              <SelectTrigger id="officer">
                <SelectValue placeholder="Select officer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {officers?.map((officer) => (
                  <SelectItem key={officer.id} value={officer.id}>
                    {officer.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {departmentId && officers?.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No officers in this department
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Complaint
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete complaint #{complaint.complaint_number}? 
                  This action cannot be undone. All associated images and comments will also be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteComplaint.isPending}
                >
                  {deleteComplaint.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className={!isAdmin ? 'ml-auto' : ''}>
          <Button
            variant="accent"
            disabled={!hasChanges || updateComplaint.isPending}
            onClick={handleUpdate}
          >
            {updateComplaint.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
