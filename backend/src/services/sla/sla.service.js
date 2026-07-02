import { Complaint } from '../../models/Complaint.js';
import { Department } from '../../models/Department.js';
import { sendNotification } from '../notification/notification.service.js';

/**
 * Calculates the SLA due date based on the complaint creation time and priority.
 * - urgent: 24 hours (1 day)
 * - high: 3 days
 * - medium: 7 days
 * - low: 14 days
 * 
 * @param {Date|string} createdAt - Creation date
 * @param {string} priority - Priority ('low', 'medium', 'high', 'urgent')
 * @returns {Date} The calculated SLA deadline Date object
 */
export function calculateSlaDeadline(createdAt, priority) {
  const date = new Date(createdAt);
  const p = (priority || 'medium').toLowerCase();

  switch (p) {
    case 'urgent':
      date.setHours(date.getHours() + 24);
      break;
    case 'high':
      date.setDate(date.getDate() + 3);
      break;
    case 'low':
      date.setDate(date.getDate() + 14);
      break;
    case 'medium':
    default:
      date.setDate(date.getDate() + 7);
      break;
  }
  return date;
}

/**
 * Automatically checks all unresolved complaints for SLA breaches,
 * escalates priority, and notifies officers and department heads.
 */
export async function checkSlaBreaches() {
  try {
    const now = new Date();
    
    // Find unresolved complaints that have passed their due date and haven't been marked as breached yet
    const breachedComplaints = await Complaint.find({
      status: { $nin: ['resolved', 'rejected', 'closed'] },
      sla_due_date: { $lte: now },
      sla_breached: false,
    });

    if (breachedComplaints.length === 0) {
      return;
    }

    console.log(`[SLAService] Found ${breachedComplaints.length} new SLA breaches. Processing escalations...`);

    for (const complaint of breachedComplaints) {
      complaint.sla_breached = true;

      // Escalate priority level if not already escalated
      if (!complaint.sla_escalated) {
        const oldPriority = complaint.priority;
        let newPriority = oldPriority;

        if (oldPriority === 'low') newPriority = 'medium';
        else if (oldPriority === 'medium') newPriority = 'high';
        else if (oldPriority === 'high') newPriority = 'urgent';

        complaint.priority = newPriority;
        complaint.sla_escalated = true;
        console.log(`[SLAService] Escalated Complaint #${complaint.complaint_number} priority: ${oldPriority} ➜ ${newPriority}`);
      }

      await complaint.save();

      // Send notifications to the assigned officer and department head
      try {
        // 1. Notify Assigned Officer
        if (complaint.assigned_to) {
          await sendNotification({
            recipientId: complaint.assigned_to.toString(),
            type: 'status_change',
            title: `SLA Breached: Complaint #${complaint.complaint_number}`,
            message: `Complaint #${complaint.complaint_number} ("${complaint.title}") has breached its SLA! Priority elevated to ${complaint.priority.toUpperCase()}.`,
            link: `/complaints/${complaint._id}`,
          });
        }

        // 2. Notify Department Head
        if (complaint.department_id) {
          const dept = await Department.findById(complaint.department_id).select('in_charge_officer_id').lean();
          if (dept?.in_charge_officer_id) {
            // Avoid double notification if the department head is also the assigned officer
            if (!complaint.assigned_to || complaint.assigned_to.toString() !== dept.in_charge_officer_id.toString()) {
              await sendNotification({
                recipientId: dept.in_charge_officer_id.toString(),
                type: 'status_change',
                title: `Department SLA Breach Alert`,
                message: `Complaint #${complaint.complaint_number} ("${complaint.title}") assigned to your department has breached its SLA.`,
                link: `/complaints/${complaint._id}`,
              });
            }
          }
        }
      } catch (notifError) {
        console.error(`[SLAService] Failed to dispatch SLA notification for #${complaint.complaint_number}:`, notifError.message);
      }
    }
  } catch (error) {
    console.error('[SLAService] Error running SLA checker:', error);
  }
}

/**
 * Initializes and starts the SLA checker cron/interval loop.
 * Runs check immediately on boot and then once every 10 minutes.
 */
export function startSlaChecker() {
  console.log('[SLAService] Starting periodic SLA breach monitor...');
  
  // Run immediately on boot
  checkSlaBreaches().catch(err => console.error('[SLAService] Startup SLA check failed:', err));

  // Run every 10 minutes
  const INTERVAL_MS = 10 * 60 * 1000;
  setInterval(() => {
    checkSlaBreaches().catch(err => console.error('[SLAService] Periodic SLA check failed:', err));
  }, INTERVAL_MS);
}
