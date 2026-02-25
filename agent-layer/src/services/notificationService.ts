/**
 * Notification Service - Slack and Email notifications
 */

import { Lead } from '../models/schema-sqlite.js';

interface NotificationConfig {
  slackWebhookUrl?: string;
  emailApiKey?: string;
  fromEmail?: string;
}

interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
}

type SlackBlock = 
  | { type: 'header'; text: { type: 'plain_text'; text: string } }
  | { type: 'section'; text: { type: 'mrkdwn'; text: string } }
  | { type: 'divider' }
  | { type: 'context'; elements: Array<{ type: 'mrkdwn'; text: string }> };

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig = {}) {
    this.config = {
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
      emailApiKey: process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL || 'notifications@jupitlunar.com',
      ...config
    };
  }

  /**
   * Send Slack notification for new lead
   */
  async notifyNewLead(lead: Lead): Promise<boolean> {
    if (!this.config.slackWebhookUrl) {
      console.log('[Notification] Slack webhook not configured, skipping notification');
      return false;
    }

    try {
      const message = this.formatSlackLeadMessage(lead);
      
      const response = await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }

      console.log(`[Notification] Slack notification sent for lead ${lead.id}`);
      return true;
    } catch (err: any) {
      console.error('[Notification] Failed to send Slack notification:', err.message);
      return false;
    }
  }

  /**
   * Send email confirmation to user
   */
  async sendConfirmationEmail(lead: Lead): Promise<boolean> {
    // Implementation depends on email provider (SendGrid, Resend, etc.)
    // This is a placeholder for the actual implementation
    
    if (!this.config.emailApiKey) {
      console.log('[Notification] Email API not configured, skipping confirmation');
      return false;
    }

    try {
      const emailContent = this.formatConfirmationEmail(lead);
      
      // Log the email that would be sent
      console.log(`[Notification] Would send email to ${lead.email}:`, emailContent.subject);
      
      // TODO: Integrate with actual email provider
      // Example with Resend:
      // await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.config.emailApiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     from: this.config.fromEmail,
      //     to: lead.email,
      //     subject: emailContent.subject,
      //     html: emailContent.html
      //   })
      // });

      console.log(`[Notification] Confirmation email queued for lead ${lead.id}`);
      return true;
    } catch (err: any) {
      console.error('[Notification] Failed to send confirmation email:', err.message);
      return false;
    }
  }

  /**
   * Send low-priority notification (batchable)
   */
  async notifyLowPriority(message: string): Promise<void> {
    if (!this.config.slackWebhookUrl) return;

    try {
      await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
    } catch (err) {
      console.error('[Notification] Failed to send low-priority notification:', err);
    }
  }

  /**
   * Format Slack message for lead notification
   */
  private formatSlackLeadMessage(lead: Lead): SlackMessage {
    const priorityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    }[lead.priority || 'low'];

    const actionLabels: Record<string, string> = {
      lead_get_matched: 'Get Matched',
      lead_request_shortlist: 'Request Shortlist',
      lead_contact_business: 'Contact Business'
    };

    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${priorityEmoji} New Lead: ${actionLabels[lead.actionType] || lead.actionType}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Contact:* ${lead.name || 'Anonymous'}\n*Email:* ${lead.email}${lead.phone ? `\n*Phone:* ${lead.phone}` : ''}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Location:* ${lead.city || 'Unknown'}, ${lead.province}\n*Vertical:* ${lead.vertical}\n*Priority:* ${lead.priority}`
          }
        },
        ...(lead.message ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:*\n>${lead.message}`
          }
        } as SlackBlock] : []),
        {
          type: 'divider'
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Lead ID: \`${lead.id}\` | Created: ${new Date(lead.createdAt).toLocaleString()}`
            }
          ]
        }
      ]
    };
  }

  /**
   * Format confirmation email content
   */
  private formatConfirmationEmail(lead: Lead): { subject: string; html: string } {
    const actionMessages: Record<string, { subject: string; body: string }> = {
      lead_get_matched: {
        subject: 'We received your request - Finding your perfect match',
        body: 'Our team is reviewing your preferences and will send you personalized recommendations within 24 hours.'
      },
      lead_request_shortlist: {
        subject: 'Your shortlist request is being prepared',
        body: 'We are curating the best options based on your requirements. Expect your shortlist soon!'
      },
      lead_contact_business: {
        subject: 'Your message has been forwarded',
        body: 'The business has been notified and will contact you directly within 24-48 hours.'
      }
    };

    const message = actionMessages[lead.actionType] || {
      subject: 'Thank you for your inquiry',
      body: 'We have received your request and will be in touch shortly.'
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${message.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #0066cc; }
    .content { padding: 30px 0; }
    .footer { text-align: center; padding: 20px 0; color: #666; font-size: 14px; border-top: 1px solid #eee; }
    .button { display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>JupitLunar</h1>
  </div>
  <div class="content">
    <h2>Hello${lead.name ? ` ${lead.name}` : ''},</h2>
    <p>${message.body}</p>
    
    ${lead.message ? `<p><strong>Your message:</strong><br><em>${lead.message}</em></p>` : ''}
    
    <p style="margin-top: 30px;">
      <strong>What's next?</strong>
    </p>
    <ul>
      <li>Check your email for updates</li>
      <li>Reply if you have any questions</li>
      <li>Expect a response within 24-48 hours</li>
    </ul>
  </div>
  <div class="footer">
    <p>Reference ID: ${lead.id}</p>
    <p>JupitLunar · Alberta's Discovery Platform</p>
  </div>
</body>
</html>`;

    return {
      subject: message.subject,
      html
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
