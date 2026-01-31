import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useSystemSettings, useUpdateSystemSetting, useUploadAvatar, useChangePassword } from '@/hooks/useSettings';
import { useTwoFactor } from '@/hooks/useTwoFactor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Bell, Shield, Save, Loader2, Upload, Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: systemSettings, isLoading: settingsLoading } = useSystemSettings();
  const updateProfile = useUpdateProfile();
  const updateSystemSetting = useUpdateSystemSetting();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();
  const twoFactor = useTwoFactor();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    statusUpdates: true,
    comments: true,
  });

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [twoFactorDialog, setTwoFactorDialog] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [existingFactors, setExistingFactors] = useState<any[]>([]);
  const [loadingFactors, setLoadingFactors] = useState(true);

  // Load existing 2FA factors
  useEffect(() => {
    const loadFactors = async () => {
      const result = await twoFactor.getFactors();
      if (result.success) {
        setExistingFactors(result.factors || []);
      }
      setLoadingFactors(false);
    };
    loadFactors();
  }, []);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
      setNotifications({
        email: profile.notification_email ?? true,
        push: profile.notification_push ?? true,
        statusUpdates: profile.notification_status_updates ?? true,
        comments: profile.notification_comments ?? true,
      });
    }
  }, [profile]);

  // Only admins can access full settings
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        notification_email: notifications.email,
        notification_push: notifications.push,
        notification_status_updates: notifications.statusUpdates,
        notification_comments: notifications.comments,
      });
      toast({
        title: 'Settings saved',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 2MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPG, PNG, or GIF image.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadAvatar.mutateAsync(file);
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been changed.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your new passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.new.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      });
      setPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast({
        title: 'Failed to change password',
        description: 'Please check your current password and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSystemSettingChange = async (key: string, value: boolean) => {
    try {
      await updateSystemSetting.mutateAsync({ key, value });
      toast({
        title: 'Setting updated',
        description: 'System configuration has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting.',
        variant: 'destructive',
      });
    }
  };

  const handleEnable2FA = async () => {
    setTwoFactorDialog(true);
    await twoFactor.enrollTOTP();
  };

  const handleVerify2FA = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    const result = await twoFactor.verifyTOTP(otpCode);
    if (result.success) {
      setTwoFactorDialog(false);
      setOtpCode('');
      const factorsResult = await twoFactor.getFactors();
      if (factorsResult.success) {
        setExistingFactors(factorsResult.factors || []);
      }
    }
  };

  const handleDisable2FA = async () => {
    if (existingFactors.length > 0) {
      const result = await twoFactor.unenrollTOTP(existingFactors[0].id);
      if (result.success) {
        setExistingFactors([]);
      }
    }
  };

  const handleClose2FADialog = () => {
    setTwoFactorDialog(false);
    setOtpCode('');
    twoFactor.cancelEnrollment();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const is2FAEnabled = existingFactors.length > 0;

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials(profile?.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
              >
                {uploadAvatar.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size 2MB
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                disabled 
                value={profile?.department_name || 'Not assigned'} 
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, email: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in browser
              </p>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, push: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status Updates</p>
              <p className="text-sm text-muted-foreground">
                Get notified when complaint status changes
              </p>
            </div>
            <Switch
              checked={notifications.statusUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, statusUpdates: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Comments</p>
              <p className="text-sm text-muted-foreground">
                Get notified on new comments
              </p>
            </div>
            <Switch
              checked={notifications.comments}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, comments: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
            <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange} disabled={changePassword.isPending}>
                    {changePassword.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Two-Factor Authentication</p>
                  {is2FAEnabled ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Enabled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      <XCircle className="h-3 w-3" />
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security with TOTP
                </p>
              </div>
            </div>
            {loadingFactors ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : is2FAEnabled ? (
              <Button variant="destructive" size="sm" onClick={handleDisable2FA}>
                Disable
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEnable2FA}>
                Enable
              </Button>
            )}
          </div>

          {/* 2FA Setup Dialog */}
          <Dialog open={twoFactorDialog} onOpenChange={handleClose2FADialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Scan the QR code with your authenticator app (like Google Authenticator or Authy), then enter the 6-digit code.
                </DialogDescription>
              </DialogHeader>
              
              {twoFactor.isEnrolling ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : twoFactor.qrCode ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <img 
                      src={twoFactor.qrCode} 
                      alt="2FA QR Code" 
                      className="w-48 h-48 border rounded-lg"
                    />
                  </div>
                  
                  {twoFactor.secret && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Or enter this code manually:
                      </p>
                      <code className="bg-muted px-3 py-1 rounded text-sm font-mono">
                        {twoFactor.secret}
                      </code>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Enter the 6-digit code from your app</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <DialogFooter>
                <Button variant="outline" onClick={handleClose2FADialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleVerify2FA} 
                  disabled={twoFactor.isVerifying || otpCode.length !== 6}
                >
                  {twoFactor.isVerifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* System Settings (Admin Only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Application-wide settings (Admin only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-assign Complaints</p>
              <p className="text-sm text-muted-foreground">
                Automatically assign complaints to officers
              </p>
            </div>
            <Switch 
              checked={systemSettings?.auto_assign_complaints ?? true}
              onCheckedChange={(checked) => handleSystemSettingChange('auto_assign_complaints', checked)}
              disabled={updateSystemSetting.isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Confirmations</p>
              <p className="text-sm text-muted-foreground">
                Require email confirmation for new accounts
              </p>
            </div>
            <Switch 
              checked={systemSettings?.email_confirmations ?? false}
              onCheckedChange={(checked) => handleSystemSettingChange('email_confirmations', checked)}
              disabled={updateSystemSetting.isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">
                Temporarily disable public access
              </p>
            </div>
            <Switch 
              checked={systemSettings?.maintenance_mode ?? false}
              onCheckedChange={(checked) => handleSystemSettingChange('maintenance_mode', checked)}
              disabled={updateSystemSetting.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
