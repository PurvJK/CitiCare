import React from 'react';
import { Bell, MessageSquare, AlertTriangle, FileText, Megaphone, Trash, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';

export function NotificationDrawer() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: deleteNotif } = useDeleteNotification();

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markRead(n.id);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'status_change':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'assignment':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent hover:text-accent-foreground rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-lg border border-border bg-white z-50">
        <DropdownMenuLabel className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead()}
              className="text-xs h-7 text-primary hover:text-primary hover:bg-transparent font-medium p-0"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center p-4 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-semibold text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                You will see updates here when status changes, comments are added, or announcements are made.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 p-4 hover:bg-accent/40 transition-colors cursor-pointer relative ${
                    !n.read ? 'bg-primary/5 hover:bg-primary/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="rounded-full p-2 bg-background border border-border shadow-sm flex items-center justify-center">
                      {getIcon(n.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className={`text-xs font-semibold text-foreground truncate ${!n.read ? 'font-bold' : ''}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  
                  {/* Action overlay */}
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-background border border-border/50 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-background border border-border/50 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif(n.id);
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
