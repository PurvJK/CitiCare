import { Bell, Menu, Search, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavBarWithLogo, getNavItems } from './NavBar';
import { NotificationDrawer } from './NotificationDrawer';
export function Header({ showMenuButton = true }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navItems = getNavItems(user?.role);
    return (<header className="sticky top-0 z-40 border-b border-border bg-white/98 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90 pt-0.5">
      <div className="tricolor-strip h-0.5 w-full absolute top-0 left-0 right-0 rounded-b-sm" aria-hidden/>
      <div className="flex h-14 items-center gap-2 px-3 md:px-6 min-w-0">
        {/* Mobile menu */}
        {showMenuButton && (<Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                <Menu className="h-5 w-5"/>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-bold">CitiCare</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-2">
                {navItems.map((item) => {
                const hasHash = item.href.includes('#');
                const [itemPath, itemHash] = item.href.split('#');
                const isActive = hasHash
                    ? location.pathname === itemPath && location.hash === `#${itemHash}`
                    : location.pathname === item.href;
                return (<Link key={item.name} to={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium', isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent')}>
                      <item.icon className="h-5 w-5"/>
                      {item.name}
                    </Link>);
            })}
              </nav>
            </SheetContent>
          </Sheet>)}

        {/* Horizontal nav: logo + links (hidden on mobile, shown from md) */}
        <div className="hidden md:flex items-center min-w-0 flex-1 overflow-hidden">
          <NavBarWithLogo />
        </div>

        {/* Mobile: logo only */}
        <Link to="/dashboard" className="flex md:hidden items-center gap-2 shrink-0">
          <div className="gradient-primary rounded-lg p-1.5">
            <span className="text-sm font-bold text-primary-foreground">CC</span>
          </div>
        </Link>

        {/* Search icon only */}
        <div className="hidden lg:flex shrink-0">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5"/>
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0 pl-2 border-l border-border/70">
          {/* Notifications */}
          <NotificationDrawer />

          {/* User Menu */}
          {user && (<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4"/>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4"/>
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4"/>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>)}
        </div>
      </div>
    </header>);
}
