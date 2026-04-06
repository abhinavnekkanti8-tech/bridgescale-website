import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface RazorpayOrder {
  id: string;
  amount: number;      // paisa
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private client: any; // typed lazily to avoid import errors if keys are missing

  constructor(private readonly config: ConfigService) {
    const keyId = this.config.get<string>('RAZORPAY_KEY_ID', '');
    const keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET', '');

    if (!this.isDummyMode() && keyId && keySecret && !keyId.startsWith('rzp_test_dummy')) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Razorpay = require('razorpay');
      this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
      this.logger.log('Razorpay client initialized (LIVE)');
    } else {
      this.logger.log('Razorpay running in DUMMY mode — no real orders will be created');
    }
  }

  private isDummyMode(): boolean {
    return this.config.get<string>('DUMMY_PAYMENT_MODE', 'true') === 'true';
  }

  get publishableKeyId(): string {
    return this.config.get<string>('RAZORPAY_KEY_ID', 'rzp_test_dummy');
  }

  /**
   * Create a Razorpay order.
   * In dummy mode returns a fake order object immediately.
   */
  async createOrder(params: {
    amountPaisa: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrder> {
    if (this.isDummyMode() || !this.client) {
      const dummyId = `order_dummy_${Date.now()}`;
      this.logger.log(`[DUMMY] Razorpay order created: ${dummyId}`);
      return {
        id: dummyId,
        amount: params.amountPaisa,
        currency: params.currency,
        receipt: params.receipt,
        status: 'created',
      };
    }

    const order = await this.client.orders.create({
      amount: params.amountPaisa,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes ?? {},
    });

    this.logger.log(`Razorpay order created: ${order.id}`);
    return order as RazorpayOrder;
  }

  /**
   * Verify Razorpay payment signature.
   * In dummy mode, any payment whose ID starts with "pay_dummy" is auto-verified.
   */
  verifyPaymentSignature(verification: RazorpayPaymentVerification): boolean {
    if (this.isDummyMode() || !this.client) {
      const isAutoApproved = verification.paymentId.startsWith('pay_dummy');
      this.logger.log(
        `[DUMMY] Signature verification: ${isAutoApproved ? 'PASSED' : 'FAILED'} for ${verification.paymentId}`,
      );
      return isAutoApproved;
    }

    const secret = this.config.get<string>('RAZORPAY_KEY_SECRET', '');
    const body = `${verification.orderId}|${verification.paymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    const valid = expected === verification.signature;

    this.logger.log(
      `Razorpay signature verification for ${verification.paymentId}: ${valid ? 'VALID' : 'INVALID'}`,
    );
    return valid;
  }

  /**
   * Verify Razorpay webhook signature.
   * Returns true if the webhook body matches the X-Razorpay-Signature header.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (this.isDummyMode()) return true;

    const webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET', '');
    const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    return expected === signature;
  }
}
