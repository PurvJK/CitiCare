import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    const { error } = await register(name, email, password);
    
    if (error) {
      let message = 'Please try again later.';
      if (error.message.includes('already registered')) {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message) {
        message = error.message;
      }
      
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created. Welcome to CitiCare!',
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--accent)/0.3),_transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">CitiCare</h1>
              <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">
                Municipal Portal
              </p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Join CitiCare
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Register to report civic issues, track resolutions, and help build a better city for everyone.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-primary-foreground/80">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                ✓
              </div>
              <span>Report issues with photos and location</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/80">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                ✓
              </div>
              <span>Get real-time status updates</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/80">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                ✓
              </div>
              <span>Rate and review resolutions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CitiCare</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Municipal Portal
              </p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Create Account</h2>
            <p className="text-muted-foreground mt-2">
              Register as a citizen to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="rounded border-input mt-1" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
