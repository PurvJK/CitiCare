import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { useUpdateComplaint, useUploadComplaintImages, } from '@/hooks/useComplaints';
import { useToast } from '@/hooks/use-toast';
import { Wrench, CheckCircle, XCircle, Loader2, DollarSign, Camera, Upload, } from 'lucide-react';
const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'Processing' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'resolved', label: 'Solved' },
    { value: 'rejected', label: 'Rejected' },
];
export function DepartmentWorkPanel({ complaint }) {
    const { toast } = useToast();
    const updateComplaint = useUpdateComplaint();
    const uploadImages = useUploadComplaintImages();
    const [status, setStatus] = useState(complaint.status);
    const [costAmount, setCostAmount] = useState(complaint.cost_estimated_amount?.toString() ?? '');
    const [costMaterials, setCostMaterials] = useState(complaint.cost_materials ?? '');
    const [costLabor, setCostLabor] = useState(complaint.cost_labor ?? '');
    const [completionRemarks, setCompletionRemarks] = useState(complaint.completion_remarks ?? '');
    const [beforeFiles, setBeforeFiles] = useState([]);
    const [afterFiles, setAfterFiles] = useState([]);
    const handleAccept = async () => {
        try {
            await updateComplaint.mutateAsync({
                id: complaint.id,
                oldStatus: complaint.status,
                accepted_by_department: true,
                status: 'in_progress',
            });
            toast({
                title: 'Complaint accepted',
                description: 'Status set to Processing.',
            });
        }
        catch (e) {
            toast({
                title: 'Failed',
                description: e.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    const handleReject = async () => {
        try {
            await updateComplaint.mutateAsync({
                id: complaint.id,
                oldStatus: complaint.status,
                accepted_by_department: false,
                status: 'rejected',
            });
            toast({
                title: 'Complaint rejected',
                description: 'The complaint has been rejected.',
            });
        }
        catch (e) {
            toast({
                title: 'Failed',
                description: e.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    const handleStatusUpdate = async () => {
        try {
            await updateComplaint.mutateAsync({
                id: complaint.id,
                oldStatus: complaint.status,
                status,
            });
            toast({
                title: 'Status updated',
                description: `Status set to ${statusOptions.find((o) => o.value === status)?.label ?? status}.`,
            });
        }
        catch (e) {
            toast({
                title: 'Update failed',
                description: e.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    const handleSubmitCost = async () => {
        const amount = costAmount ? Number(costAmount) : null;
        try {
            await updateComplaint.mutateAsync({
                id: complaint.id,
                oldStatus: complaint.status,
                cost_estimated_amount: amount ?? undefined,
                cost_materials: costMaterials || undefined,
                cost_labor: costLabor || undefined,
                cost_status: 'submitted',
            });
            toast({
                title: 'Cost submitted',
                description: 'Estimate sent to Municipal Head for approval.',
            });
        }
        catch (e) {
            toast({
                title: 'Submit failed',
                description: e.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    const handleMarkSolved = async () => {
        try {
            await updateComplaint.mutateAsync({
                id: complaint.id,
                oldStatus: complaint.status,
                status: 'resolved',
                completion_remarks: completionRemarks || undefined,
            });
            if (beforeFiles.length > 0) {
                await uploadImages.mutateAsync({
                    complaintId: complaint.id,
                    images: beforeFiles,
                    type: 'before',
                });
            }
            if (afterFiles.length > 0) {
                await uploadImages.mutateAsync({
                    complaintId: complaint.id,
                    images: afterFiles,
                    type: 'after',
                });
            }
            toast({
                title: 'Marked as Solved',
                description: 'Completion details and photos have been saved.',
            });
            setBeforeFiles([]);
            setAfterFiles([]);
            setCompletionRemarks('');
        }
        catch (e) {
            toast({
                title: 'Failed',
                description: e.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    const notYetAccepted = complaint.accepted_by_department === null ||
        complaint.accepted_by_department === undefined;
    const canAcceptReject = complaint.status === 'pending' && notYetAccepted;
    const costNotSubmitted = !complaint.cost_status || complaint.cost_status === 'pending' || complaint.cost_status === 'rejected';
    const canSubmitCost = complaint.accepted_by_department &&
        complaint.status !== 'rejected' &&
        costNotSubmitted;
    const canComplete = complaint.accepted_by_department &&
        complaint.status !== 'resolved' &&
        complaint.status !== 'rejected';
    return (<div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Wrench className="h-5 w-5"/>
        Department Work
      </h2>

      {/* Accept / Reject */}
      {canAcceptReject && (<div className="flex flex-wrap gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" size="sm">
                <CheckCircle className="mr-2 h-4 w-4"/>
                Accept Complaint
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Accept complaint</AlertDialogTitle>
                <AlertDialogDescription>
                  Accept this complaint and set status to Processing?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleAccept} disabled={updateComplaint.isPending}>
                  {updateComplaint.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                  Accept
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <XCircle className="mr-2 h-4 w-4"/>
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject complaint</AlertDialogTitle>
                <AlertDialogDescription>
                  Reject this complaint? Status will be set to Rejected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReject} className="bg-destructive text-destructive-foreground" disabled={updateComplaint.isPending}>
                  {updateComplaint.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>)}

      {/* Status */}
      {complaint.status !== 'rejected' && complaint.accepted_by_department && (<div className="space-y-2">
          <Label>Update status</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="secondary" disabled={status === complaint.status || updateComplaint.isPending} onClick={handleStatusUpdate}>
              {updateComplaint.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
              Update
            </Button>
          </div>
        </div>)}

      {/* Cost estimation */}
      {canSubmitCost && (<div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4"/>
            Cost estimation (submit to Municipal Head)
          </h3>
          {complaint.cost_status === 'rejected' && (<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              ⚠️ Previous estimate was rejected. Please revise and resubmit.
            </div>)}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Estimated amount (₹)</Label>
              <Input type="number" min={0} placeholder="e.g. 5000" value={costAmount} onChange={(e) => setCostAmount(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label>Materials cost</Label>
              <Input placeholder="Materials description / cost" value={costMaterials} onChange={(e) => setCostMaterials(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label>Labor cost</Label>
              <Input placeholder="Labor description / cost" value={costLabor} onChange={(e) => setCostLabor(e.target.value)}/>
            </div>
          </div>
          <Button size="sm" variant="accent" disabled={updateComplaint.isPending} onClick={handleSubmitCost}>
            {updateComplaint.isPending && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
            Submit cost for approval
          </Button>
        </div>)}

      {/* Already submitted cost */}
      {complaint.cost_status === 'submitted' && (<div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
          ⏳ Cost submitted: ₹{complaint.cost_estimated_amount ?? '—'} — awaiting
          approval.
        </div>)}

      {/* Cost approved */}
      {complaint.cost_status === 'approved' && (<div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          ✓ Cost approved: ₹{complaint.cost_estimated_amount ?? '—'} — You can proceed with the work.
        </div>)}

      {/* Work completion */}
      {canComplete && (<div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Camera className="h-4 w-4"/>
            Work completion
          </h3>
          <div className="space-y-2">
            <Label>Before photo(s)</Label>
            <Input type="file" accept="image/*" multiple className="cursor-pointer" onChange={(e) => setBeforeFiles(e.target.files ? Array.from(e.target.files) : [])}/>
          </div>
          <div className="space-y-2">
            <Label>After photo(s)</Label>
            <Input type="file" accept="image/*" multiple className="cursor-pointer" onChange={(e) => setAfterFiles(e.target.files ? Array.from(e.target.files) : [])}/>
          </div>
          <div className="space-y-2">
            <Label>Completion remarks</Label>
            <Textarea placeholder="Brief remarks on work done..." value={completionRemarks} onChange={(e) => setCompletionRemarks(e.target.value)} rows={2}/>
          </div>
          <Button size="sm" variant="accent" disabled={updateComplaint.isPending || uploadImages.isPending} onClick={handleMarkSolved}>
            {(updateComplaint.isPending || uploadImages.isPending) && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
            <Upload className="mr-2 h-4 w-4"/>
            Mark as Solved
          </Button>
        </div>)}
    </div>);
}
