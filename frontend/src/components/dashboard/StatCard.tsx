import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  /** When set, the card becomes a clickable link (e.g. to filtered complaints). */
  href?: string;
}

const cardClasses =
  'rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5';

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'bg-accent/10 text-accent',
  className,
  href,
}: StatCardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {change && (
          <p
            className={cn(
              'text-xs font-medium',
              changeType === 'positive' && 'text-success',
              changeType === 'negative' && 'text-destructive',
              changeType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {change}
          </p>
        )}
        {href && (
          <p className="text-xs font-medium text-primary mt-1">View →</p>
        )}
      </div>
      <div className={cn('rounded-lg p-3', iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className={cn(cardClasses, 'block cursor-pointer', className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn(cardClasses, className)}>{content}</div>;
}
