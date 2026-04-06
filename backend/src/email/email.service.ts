import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { applicationReceivedEmail, statusUpdateEmail, magicLinkEmail } from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: any | null = null;
  private readonly fromAddress: string;
  private readonly isDummy: boolean;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('EMAIL_API_KEY', '');
    this.fromAddress = this.config.get<string>('EMAIL_FROM', 'noreply@bridgesales.com');

    // Detect dummy mode — skip sending if key is missing or placeholder
    this.isDummy = !apiKey || apiKey.includes('dummy') || apiKey.includes('replace');

    if (!this.isDummy) {
      // Dynamic import to avoid crash if resend package is not installed
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend');
        this.resend = new Resend(apiKey);
        this.logger.log('Email service initialized with Resend provider.');
      } catch {
        this.logger.warn('Resend package not installed — falling back to console logging.');
        this.isDummy = true;
      }
    } else {
      this.logger.log('Email service running in DUMMY MODE — emails will be logged to console.');
    }
  }

  /**
   * Send application received confirmation email.
   */
  async sendApplicationReceived(application: {
    id: string;
    name: string;
    email: string;
    type: 'COMPANY' | 'TALENT';
  }): Promise<void> {
    const { subject, html } = applicationReceivedEmail({
      name: application.name,
      type: application.type,
      applicationId: application.id,
    });

    await this.send(application.email, subject, html);
  }

  /**
   * Send application status update email.
   */
  async sendStatusUpdate(application: {
    id: string;
    name: string;
    email: string;
  }, newStatus: string): Promise<void> {
    const { subject, html } = statusUpdateEmail({
      name: application.name,
      applicationId: application.id,
      newStatus,
    });

    await this.send(application.email, subject, html);
  }

  /**
   * Send magic-link login email.
   */
  async sendMagicLink(params: {
    name: string;
    email: string;
    magicUrl: string;
    expiryMinutes?: number;
  }): Promise<void> {
    const { subject, html } = magicLinkEmail({
      name: params.name,
      magicUrl: params.magicUrl,
      expiryMinutes: params.expiryMinutes ?? 30,
    });
    await this.send(params.email, subject, html);
  }

  /**
   * Core send method — sends via Resend or logs to console in dummy mode.
   */
  private async send(to: string, subject: string, html: string): Promise<void> {
    if (this.isDummy) {
      this.logger.log(`[DUMMY EMAIL] To: ${to}`);
      this.logger.log(`[DUMMY EMAIL] Subject: ${subject}`);
      this.logger.log(`[DUMMY EMAIL] Body length: ${html.length} chars`);
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromAddress,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}: ${subject} (id: ${result?.data?.id ?? 'unknown'})`);
    } catch (err: unknown) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
      // Don't throw — email failures shouldn't block application flow
    }
  }
}
