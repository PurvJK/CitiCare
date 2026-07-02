import { Complaint } from '../models/Complaint.js';

export async function getDepartmentOverview(_req, res) {
  try {
    const complaints = await Complaint.find()
      .populate('department_id', 'name')
      .select('department_id status cost_status cost_estimated_amount feedback_rating sla_due_date resolved_at completed_at sla_breached')
      .lean();

    const byDepartment = new Map();
    const now = new Date();

    const getDeptKey = (c) => {
      const dep = c?.department_id;
      if (!dep) return 'unassigned';
      const depId = dep?._id?.toString?.() ?? dep?.toString?.();
      return depId || 'unassigned';
    };

    for (const complaint of complaints) {
      const key = getDeptKey(complaint);
      const dep = complaint?.department_id;
      const depId = dep?._id?.toString?.() ?? null;
      const depName = dep?.name ?? 'Unassigned';

      if (!byDepartment.has(key)) {
        byDepartment.set(key, {
          department_id: depId,
          department_name: depName,
          total_complaints: 0,
          pending: 0,
          in_progress: 0,
          on_hold: 0,
          resolved: 0,
          rejected: 0,
          closed: 0,
          total_estimated_cost: 0,
          approved_cost: 0,
          rejected_cost: 0,
          feedback_sum: 0,
          feedback_count: 0,
          sla_met: 0,
          sla_breached: 0,
          sla_active_overdue: 0,
        });
      }

      const row = byDepartment.get(key);
      row.total_complaints += 1;

      if (complaint.status === 'pending') row.pending += 1;
      else if (complaint.status === 'in_progress') row.in_progress += 1;
      else if (complaint.status === 'on_hold') row.on_hold += 1;
      else if (complaint.status === 'resolved') row.resolved += 1;
      else if (complaint.status === 'rejected') row.rejected += 1;
      else if (complaint.status === 'closed') row.closed += 1;

      const amount = Number(complaint.cost_estimated_amount || 0);
      if (amount > 0) {
        row.total_estimated_cost += amount;
        if (complaint.cost_status === 'approved') row.approved_cost += amount;
        if (complaint.cost_status === 'rejected') row.rejected_cost += amount;
      }

      const rating = Number(complaint.feedback_rating || 0);
      if (rating >= 1 && rating <= 5) {
        row.feedback_sum += rating;
        row.feedback_count += 1;
      }

      // SLA Calculations
      if (complaint.sla_due_date) {
        const dueDate = new Date(complaint.sla_due_date);
        const isResolved = ['resolved', 'rejected', 'closed'].includes(complaint.status);
        
        if (isResolved) {
          const resolvedAt = complaint.resolved_at 
            ? new Date(complaint.resolved_at) 
            : (complaint.completed_at ? new Date(complaint.completed_at) : now);
          if (resolvedAt <= dueDate) {
            row.sla_met += 1;
          } else {
            row.sla_breached += 1;
          }
        } else {
          const isOverdue = now > dueDate || complaint.sla_breached === true;
          if (isOverdue) {
            row.sla_active_overdue += 1;
            row.sla_breached += 1;
          }
        }
      }
    }

    const departments = Array.from(byDepartment.values())
      .map((d) => {
        const resolvedSlaTotal = d.sla_met + (d.sla_breached - d.sla_active_overdue);
        return {
          department_id: d.department_id,
          department_name: d.department_name,
          total_complaints: d.total_complaints,
          pending: d.pending,
          in_progress: d.in_progress,
          on_hold: d.on_hold,
          resolved: d.resolved,
          rejected: d.rejected,
          closed: d.closed,
          resolution_rate: d.total_complaints > 0 ? Math.round((d.resolved / d.total_complaints) * 100) : 0,
          total_estimated_cost: d.total_estimated_cost,
          approved_cost: d.approved_cost,
          rejected_cost: d.rejected_cost,
          avg_feedback_rating: d.feedback_count > 0 ? Number((d.feedback_sum / d.feedback_count).toFixed(1)) : null,
          feedback_count: d.feedback_count,
          sla_met: d.sla_met,
          sla_active_overdue: d.sla_active_overdue,
          sla_compliance_rate: resolvedSlaTotal > 0 ? Math.round((d.sla_met / resolvedSlaTotal) * 100) : 100,
        };
      })
      .sort((a, b) => b.total_complaints - a.total_complaints);

    const summary = departments.reduce(
      (acc, d) => {
        acc.total_complaints += d.total_complaints;
        acc.pending += d.pending;
        acc.in_progress += d.in_progress;
        acc.on_hold += d.on_hold;
        acc.resolved += d.resolved;
        acc.rejected += d.rejected;
        acc.closed += d.closed;
        acc.total_estimated_cost += d.total_estimated_cost;
        acc.approved_cost += d.approved_cost;
        acc.rejected_cost += d.rejected_cost;
        acc.feedback_sum += (d.avg_feedback_rating || 0) * d.feedback_count;
        acc.feedback_count += d.feedback_count;
        acc.sla_met += d.sla_met;
        acc.sla_active_overdue += d.sla_active_overdue;
        return acc;
      },
      {
        total_complaints: 0,
        pending: 0,
        in_progress: 0,
        on_hold: 0,
        resolved: 0,
        rejected: 0,
        closed: 0,
        total_estimated_cost: 0,
        approved_cost: 0,
        rejected_cost: 0,
        feedback_sum: 0,
        feedback_count: 0,
        sla_met: 0,
        sla_active_overdue: 0,
      }
    );

    const totalResolvedSla = summary.sla_met + (summary.total_complaints - summary.pending - summary.in_progress - summary.on_hold - summary.sla_met - summary.sla_active_overdue);

    res.json({
      summary: {
        total_complaints: summary.total_complaints,
        pending: summary.pending,
        in_progress: summary.in_progress,
        on_hold: summary.on_hold,
        resolved: summary.resolved,
        rejected: summary.rejected,
        closed: summary.closed,
        resolution_rate: summary.total_complaints > 0 ? Math.round((summary.resolved / summary.total_complaints) * 100) : 0,
        total_estimated_cost: summary.total_estimated_cost,
        approved_cost: summary.approved_cost,
        rejected_cost: summary.rejected_cost,
        avg_feedback_rating: summary.feedback_count > 0 ? Number((summary.feedback_sum / summary.feedback_count).toFixed(1)) : null,
        feedback_count: summary.feedback_count,
        sla_met: summary.sla_met,
        sla_active_overdue: summary.sla_active_overdue,
        sla_compliance_rate: totalResolvedSla > 0 ? Math.round((summary.sla_met / totalResolvedSla) * 100) : 100,
      },
      departments,
    });
  } catch (e) {
    console.error('[GET /analytics/department-overview]', e);
    res.status(500).json({ error: 'Failed to fetch department analytics' });
  }
}
