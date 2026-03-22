import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useWards } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';
export default function Profile() {
    const { user } = useAuth();
    const { toast } = useToast();
    const { data: profile, isLoading: profileLoading } = useProfile();
    const { data: wards = [], isLoading: wardsLoading } = useWards();
    const updateProfile = useUpdateProfile();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressLine, setAddressLine] = useState('');
    const [wardId, setWardId] = useState('');
    useEffect(() => {
        if (!profile)
            return;
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setAddressLine(profile.address_line || '');
        setWardId(profile.ward_id || '');
    }, [profile]);
    if (!user)
        return <Navigate to="/login" replace/>;
    const handleSave = async () => {
        try {
            await updateProfile.mutateAsync({
                full_name: fullName,
                phone: phone || undefined,
                address_line: addressLine || undefined,
                ward_id: wardId || null,
            });
            toast({
                title: 'Profile updated',
                description: 'Your address and ward preferences are saved.',
            });
        }
        catch (e) {
            toast({
                title: 'Update failed',
                description: e?.response?.data?.error || e?.message || 'Please try again.',
                variant: 'destructive',
            });
        }
    };
    if (profileLoading) {
        return (<div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent"/>
      </div>);
    }
    return (<div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Set your address and ward for Nearby complaints.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5"/>
            Personal Details
          </CardTitle>
          <CardDescription>These details are used in your account and Nearby view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line">Address</Label>
            <Input id="address_line" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="House no, street, landmark"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward_id" className="flex items-center gap-1">
              <MapPin className="h-4 w-4"/>
              Ward
            </Label>
            <select id="ward_id" value={wardId} onChange={(e) => setWardId(e.target.value)} className="w-full border rounded-md p-2 bg-background" disabled={wardsLoading}>
              <option value="">Select ward</option>
              {wards.map((ward) => (<option key={ward.id} value={ward.id}>
                  {ward.name}
                </option>))}
            </select>
            <p className="text-xs text-muted-foreground">
              Nearby page uses this ward by default.
            </p>
          </div>

          <div className="pt-2">
            <Button onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
}
