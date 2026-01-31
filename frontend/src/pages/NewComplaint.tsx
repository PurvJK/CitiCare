import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationSelector } from '@/components/complaint/LocationSelector';
import { ImageUpload } from '@/components/complaint/ImageUpload';
import { useCreateComplaint, useDepartments } from '@/hooks/useComplaints';
import { MapPin, Loader2, CheckCircle, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { complaintCategories } from '@/data/categories';

export default function NewComplaint() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const createComplaint = useCreateComplaint();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedZone || !selectedWard) {
      toast({
        title: 'Location Required',
        description: 'Please select Zone and Ward to file a complaint.',
        variant: 'destructive',
      });
      return;
    }

    if (!departmentId) {
      toast({
        title: 'Department Required',
        description: 'Please select the department that should handle this complaint.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createComplaint.mutateAsync({
        title,
        description,
        category,
        address,
        zone_id: selectedZone,
        ward_id: selectedWard,
        area_id: selectedArea || undefined,
        department_id: departmentId,
        images,
      });
      
      toast({
        title: 'Complaint Submitted!',
        description: `Your complaint has been registered. ID: ${result.complaint_number}`,
      });
      
      navigate('/complaints');
    } catch (error: any) {
      toast({
        title: 'Failed to submit complaint',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Building2 className="h-4 w-4" />
          <span>Municipal Corporation</span>
        </div>
        <h1 className="text-2xl font-bold">File a New Complaint</h1>
        <p className="text-muted-foreground">
          Report a civic issue in your area. Provide as much detail as possible for faster resolution.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select complaint category" />
              </SelectTrigger>
              <SelectContent>
                {complaintCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department - only departments from database */}
          <div className="space-y-2">
            <Label htmlFor="department">
              <Building2 className="inline h-4 w-4 mr-1" />
              Department *
            </Label>
            <Select
              value={departmentId}
              onValueChange={setDepartmentId}
              required
              disabled={departmentsLoading || !departments?.length}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder={departmentsLoading ? 'Loading departments...' : 'Select department'} />
              </SelectTrigger>
              <SelectContent>
                {(departments ?? []).map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!departmentsLoading && (!departments || departments.length === 0) && (
              <p className="text-xs text-muted-foreground">
                No departments configured yet. Contact the municipal admin to add departments (e.g. Road, Water, Electricity).
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Complaint Title *</Label>
            <Input
              id="title"
              placeholder="Brief title describing the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description of the issue..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
          <h3 className="font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Location Details
          </h3>

          {/* Zone/Ward/Area Selector */}
          <LocationSelector
            selectedZone={selectedZone}
            selectedWard={selectedWard}
            selectedArea={selectedArea}
            onZoneChange={setSelectedZone}
            onWardChange={setSelectedWard}
            onAreaChange={setSelectedArea}
          />

          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Street Address / Landmark *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                className="pl-10"
                placeholder="Enter nearby landmark or exact address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
          <h3 className="font-semibold">Upload Photos</h3>
          <p className="text-sm text-muted-foreground">
            Add photos of the issue to help officials understand the problem better.
          </p>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={5}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="accent" disabled={createComplaint.isPending} className="flex-1 md:flex-none">
            {createComplaint.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Complaint
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
