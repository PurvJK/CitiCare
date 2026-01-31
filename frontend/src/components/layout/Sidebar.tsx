import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  FileText,
  PlusCircle,
  Map,
  BarChart3,
  Users,
  Settings,
  Building2,
  FolderOpen,
  HardHat,
  ClipboardList,
  X,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const citizenNav = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'File Complaint', href: '/complaints/new', icon: PlusCircle },
  { name: 'My Complaints', href: '/complaints', icon: FileText },
  { name: 'Track Status', href: '/track', icon: Map },
  { name: 'Public Projects', href: '/projects', icon: HardHat },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
];

const officerNav = [
  { name: 'Department Dashboard', href: '/department', icon: Building2 },
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Assigned Complaints', href: '/complaints', icon: ClipboardList },
  { name: 'Ward Map', href: '/map', icon: Map },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const departmentHeadNav = [
  { name: 'Department Dashboard', href: '/department', icon: Building2 },
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Complaints', href: '/complaints', icon: FileText },
  { name: 'Officers', href: '/officers', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: ClipboardList },
];

const adminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'All Complaints', href: '/complaints', icon: FileText },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'City Map', href: '/map', icon: Map },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
  { name: 'Projects', href: '/projects', icon: HardHat },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'officer':
        return officerNav;
      case 'department_head':
        return departmentHeadNav;
      case 'admin':
        return adminNav;
      default:
        return citizenNav;
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
                <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">CitiCare</h1>
                <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
                  Municipal Portal
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Role Badge */}
          {user && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="rounded-lg bg-sidebar-accent p-3">
                <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">
                  Logged in as
                </p>
                <p className="text-sm font-medium text-sidebar-foreground capitalize mt-1">
                  {user.role.replace('_', ' ')}
                </p>
                {user.ward && (
                  <p className="text-xs text-sidebar-foreground/60 mt-0.5">
                    {user.ward}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
