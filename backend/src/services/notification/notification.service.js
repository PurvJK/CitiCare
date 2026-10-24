import nodemailer from 'nodemailer';
import { User } from '../../models/User.js';
import { Notification } from '../../models/Notification.js';

let transporter;

/**
 * Get or create the Nodemailer transporter (reused across calls)
 * Uses SMTP settings from .env if defined, with Gmail service optimization and resilient timeouts.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST?.trim();
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (host && user && pass) {
    const isGmail = host.toLowerCase().includes('gmail');
    console.log(`[NotificationService] Creating SMTP transporter for ${isGmail ? 'Gmail' : host} (${user})`);
    
    transporter = nodemailer.createTransport({
      ...(isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
          }
        : {
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          }),
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    console.warn('[NotificationService] No SMTP credentials found in environment. Email dispatch will use mock logger.');
    transporter = {
      sendMail: async (mailOptions) => {
        console.warn(`[NotificationService] [MOCK SEND MAIL]: Email to ${mailOptions?.to} was not sent because SMTP_USER and SMTP_PASS are not configured.`);
        return { messageId: `mock-msg-${Date.now()}` };
      },
      verify: async () => {
        throw new Error('SMTP credentials are not configured in environment variables.');
      },
    };
  }
  return transporter;
}

/**
 * Test SMTP connection and return diagnostics
 */
export async function verifySmtp() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) {
    return {
      configured: false,
      error: 'SMTP_HOST, SMTP_USER, or SMTP_PASS environment variables are missing.',
    };
  }

  try {
    const t = await getTransporter();
    if (t.verify) {
      await t.verify();
    }
    return {
      configured: true,
      user,
      host,
      status: 'connected',
    };
  } catch (err) {
    return {
      configured: true,
      user,
      host,
      status: 'error',
      error: err.message,
    };
  }
}

/**
 * Send a notification to a specific user (In-App and/or Email based on preferences)
 */
export async function sendNotification({ recipientId, senderId = null, type, title, message, link = null }) {
  try {
    // 1. Fetch recipient and their preferences
    const recipient = await User.findById(recipientId)
      .select('email full_name notification_email notification_push notification_status_updates notification_comments')
      .lean();

    if (!recipient) {
      console.warn(`[NotificationService] Recipient ${recipientId} not found. Skipping notification.`);
      return null;
    }

    // 2. Evaluate preferences (defaults to true if undefined/null)
    const wantsPush = recipient.notification_push !== false;
    const wantsEmail = recipient.notification_email !== false;

    // Respect specific notification triggers
    if (type === 'status_change' && recipient.notification_status_updates === false) {
      console.log(`[NotificationService] User ${recipientId} disabled status update alerts. Skipping.`);
      return null;
    }
    if (type === 'new_comment' && recipient.notification_comments === false) {
      console.log(`[NotificationService] User ${recipientId} disabled comment alerts. Skipping.`);
      return null;
    }

    let savedNotif = null;

    // 3. Dispatch In-App Notification (database document)
    if (wantsPush) {
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type,
        title,
        message,
        link,
      });

      savedNotif = await notification.save();
      console.log(`[NotificationService] Saved in-app notification for user ${recipientId}`);
    }

    // 4. Dispatch Email Alert asynchronously in background (non-blocking)
    if (wantsEmail && recipient.email) {
      (async () => {
        try {
          const clientTransporter = await getTransporter();
          const smtpUser = process.env.SMTP_USER?.trim();
          const mailFrom = process.env.SMTP_FROM?.trim() || (smtpUser ? `CitiCare <${smtpUser}>` : 'CitiCare <noreply@citicare.local>');
          const frontendUrl = process.env.CLIENT_URL || 'https://citi-care.vercel.app';
          
          function escapeHtml(str) {
            if (str == null) return '';
            return String(str)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
          }

          const safeTitle = escapeHtml(title);
          const safeMessage = escapeHtml(message);
          const safeLink = link && typeof link === 'string' && link.startsWith('/') ? encodeURI(link) : null;

          const htmlContent = `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
              <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">CitiCare Notification</h2>
              </div>
              <p style="font-size: 15px; color: #1f2937; font-weight: 600; margin: 0 0 10px 0;">${safeTitle}</p>
              <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">${safeMessage}</p>
              ${safeLink ? `
                <div style="margin-top: 24px; margin-bottom: 10px;">
                  <a href="${frontendUrl}${safeLink}" 
                     style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; display: inline-block;">
                    View in CitiCare
                  </a>
                </div>
              ` : ''}
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0 16px 0;" />
              <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
                You received this email because you are registered on CitiCare. You can manage your email alerts inside your Profile page.
              </p>
            </div>
          `;

          const info = await clientTransporter.sendMail({
            from: mailFrom,
            to: `${recipient.full_name || 'Citizen'} <${recipient.email}>`,
            subject: `[CitiCare] ${title}`,
            text: `${title}\n\n${message}\n\nLink: ${link ? frontendUrl + link : 'N/A'}`,
            html: htmlContent,
          });

          console.log(`[NotificationService] Sent email to ${recipient.email}: ${info.messageId}`);
        } catch (emailErr) {
          console.error(`[NotificationService] Failed to send email to ${recipient.email}:`, emailErr.message);
        }
      })();
    }

    return savedNotif;
  } catch (error) {
    console.error('[NotificationService] Error in unified sendNotification:', error);
    throw error;
  }
}
