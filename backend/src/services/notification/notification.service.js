import nodemailer from 'nodemailer';
import { User } from '../../models/User.js';
import { Notification } from '../../models/Notification.js';

let transporter;

/**
 * Get or create the Nodemailer transporter (reused across calls)
 * Uses SMTP settings from .env if defined, otherwise falls back to a dynamically
 * generated Ethereal Email test account for local development.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log('[NotificationService] Creating SMTP transporter from env configuration');
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    console.log('[NotificationService] No SMTP credentials found. Attempting to generate Ethereal developer test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[NotificationService] Ethereal test account generated successfully: ${testAccount.user}`);
      console.log(`[NotificationService] View sent emails at https://ethereal.email/login with credentials: user="${testAccount.user}" pass="${testAccount.pass}"`);
    } catch (err) {
      console.error('[NotificationService] Failed to create Ethereal test account (possible network restriction):', err.message);
      // Fallback to a mock transporter to avoid crashing or breaking operations
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('[NotificationService] [MOCK SEND MAIL LOG - NO EMAIL DISPATCHED]:', mailOptions);
          return { messageId: `mock-msg-${Date.now()}` };
        },
      };
    }
  }
  return transporter;
}

/**
 * Send a notification to a specific user (In-App and/or Email based on preferences)
 * @param {Object} params
 * @param {string} params.recipientId - ID of the user receiving the notification
 * @param {string} [params.senderId=null] - ID of the user who triggered it
 * @param {string} params.type - Type of notification ('status_change', 'new_comment', 'assignment', 'announcement')
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification body content
 * @param {string} [params.link=null] - Frontend path to redirect on click
 * @returns {Promise<Object|null>} The created database notification document, if saved
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
    } else {
      console.log(`[NotificationService] User ${recipientId} disabled in-app notifications. Skipping database save.`);
    }

    // 4. Dispatch Email Alert
    if (wantsEmail && recipient.email) {
      try {
        const clientTransporter = await getTransporter();
        const mailFrom = process.env.SMTP_FROM || 'CitiCare <noreply@citicare.local>';
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:8080';
        
        const htmlContent = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
              <h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">CitiCare Notification</h2>
            </div>
            <p style="font-size: 15px; color: #1f2937; font-weight: 600; margin: 0 0 10px 0;">${title}</p>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">${message}</p>
            ${link ? `
              <div style="margin-top: 24px; margin-bottom: 10px;">
                <a href="${frontendUrl}${link}" 
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
          to: `${recipient.full_name} <${recipient.email}>`,
          subject: `[CitiCare] ${title}`,
          text: `${title}\n\n${message}\n\nLink: ${link ? frontendUrl + link : 'N/A'}`,
          html: htmlContent,
        });

        console.log(`[NotificationService] Sent email to ${recipient.email}: ${info.messageId}`);
        if (info.messageId && info.messageId.includes('<') && info.messageId.includes('ethereal')) {
          console.log(`[NotificationService] Preview sent Ethereal email at: ${nodemailer.getTestMessageUrl(info)}`);
        }
      } catch (emailErr) {
        console.error(`[NotificationService] Failed to send email to ${recipient.email}:`, emailErr.message);
      }
    }

    return savedNotif;
  } catch (error) {
    console.error('[NotificationService] Error in unified sendNotification:', error);
    throw error;
  }
}
