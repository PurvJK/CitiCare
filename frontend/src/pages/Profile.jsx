import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, MapPin, User, Bell } from 'lucide-react';
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
    
    // Notification preferences state
    const [notificationEmail, setNotificationEmail] = useState(true);
    const [notificationPush, setNotificationPush] = useState(true);
    const [notificationStatusUpdates, setNotificationStatusUpdates] = useState(true);
    const [notificationComments, setNotificationComments] = useState(true);

    useEffect(() => {
        if (!profile) return;
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
        setAddressLine(profile.address_line || '');
        setWardId(profile.ward_id || '');
        
        // Load notification preferences from profile data
        setNotificationEmail(profile.notification_email ?? true);
        setNotificationPush(profile.notification_push ?? true);
        setNotificationStatusUpdates(profile.notification_status_updates ?? true);
        setNotificationComments(profile.notification_comments ?? true);
    }, [profile]);

    if (!user) return <Navigate to="/login" replace/>;

    const handleSave = async () => {
        try {
            await updateProfile.mutateAsync({
                full_name: fullName,
                phone: phone || undefined,
                address_line: addressLine || undefined,
                ward_id: wardId || null,
                notification_email: notificationEmail,
                notification_push: notificationPush,
                notification_status_updates: notificationStatusUpdates,
                notification_comments: notificationComments,
            });
            toast({
                title: 'Profile updated',
                description: 'Your profile settings and notification preferences are saved.',
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
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-accent"/>
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal settings and notification preferences.</p>
            </div>

            {/* Personal Details */}
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
                            {wards.map((ward) => (
                                <option key={ward.id} value={ward.id}>
                                    {ward.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                            Nearby page uses this ward by default.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5"/>
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Control how you receive alerts and notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Email Alerts</p>
                            <p className="text-xs text-muted-foreground">Receive copies of updates in your inbox</p>
                        </div>
                        <Switch checked={notificationEmail} onCheckedChange={setNotificationEmail} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">In-App Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive real-time alerts in your notification bell drawer</p>
                        </div>
                        <Switch checked={notificationPush} onCheckedChange={setNotificationPush} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Status Updates</p>
                            <p className="text-xs text-muted-foreground">Get notified when your complaints are updated</p>
                        </div>
                        <Switch checked={notificationStatusUpdates} onCheckedChange={setNotificationStatusUpdates} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm">Comment Alerts</p>
                            <p className="text-xs text-muted-foreground">Get notified on discussions and comments</p>
                        </div>
                        <Switch checked={notificationComments} onCheckedChange={setNotificationComments} />
                    </div>
                </CardContent>
            </Card>

            {/* Action Button */}
            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={updateProfile.isPending} className="px-6">
                    {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
