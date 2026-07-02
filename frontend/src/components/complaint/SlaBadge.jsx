import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Renders a stylized badge showing a complaint's SLA status.
 * - Resolved: SLA Met (green) or SLA Breached (gray)
 * - Overdue: Overdue alert (red pulsating)
 * - Within deadline: Due in X days/hours (yellow/blue)
 * 
 * @param {Object} props
 * @param {Object} props.complaint - The complaint object containing status, resolved_at, and sla_due_date
 */
export function SlaBadge({ complaint }) {
  if (!complaint || !complaint.sla_due_date) return null;

  const dueDate = new Date(complaint.sla_due_date);
  const now = new Date();
  const isResolved = ['resolved', 'rejected', 'closed'].includes(complaint.status);
  
  if (isResolved) {
    const resolvedAt = complaint.resolved_at 
      ? new Date(complaint.resolved_at) 
      : (complaint.completed_at ? new Date(complaint.completed_at) : now);
    const metSla = resolvedAt <= dueDate;

    return metSla ? (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 font-medium flex items-center gap-1.5 py-0.5 px-2 rounded-full shrink-0">
        <CheckCircle className="h-3 w-3" />
        <span>SLA Met</span>
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-medium flex items-center gap-1.5 py-0.5 px-2 rounded-full shrink-0">
        <AlertCircle className="h-3 w-3" />
        <span>SLA Breached</span>
      </Badge>
    );
  }

  const isOverdue = now > dueDate || complaint.sla_breached;
  const diffMs = dueDate - now;

  if (isOverdue) {
    const diffDays = Math.floor(Math.abs(now - dueDate) / (1000 * 60 * 60 * 24));
    const label = diffDays === 0 ? 'Overdue today' : `Overdue by ${diffDays}d`;
    return (
      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 font-semibold flex items-center gap-1.5 py-0.5 px-2 rounded-full animate-pulse shrink-0">
        <AlertCircle className="h-3 w-3" />
        <span>{label}</span>
      </Badge>
    );
  }

  // Calculate time remaining for active complaints
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium flex items-center gap-1.5 py-0.5 px-2 rounded-full shrink-0">
        <Clock className="h-3 w-3 text-amber-600 animate-spin-slow" />
        <span>Due in {diffMins}m</span>
      </Badge>
    );
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium flex items-center gap-1.5 py-0.5 px-2 rounded-full shrink-0">
        <Clock className="h-3 w-3 text-amber-600" />
        <span>Due in {diffHours}h</span>
      </Badge>
    );
  }

  const diffDays = Math.floor(diffHours / 24);
  const colorClass = diffDays <= 1 
    ? 'bg-amber-50 text-amber-700 border-amber-200' 
    : 'bg-blue-50 text-blue-700 border-blue-200/60';

  return (
    <Badge variant="outline" className={`${colorClass} font-medium flex items-center gap-1.5 py-0.5 px-2 rounded-full shrink-0`}>
      <Clock className="h-3 w-3" />
      <span>Due in {diffDays}d</span>
    </Badge>
  );
}
