import { ConfigService } from '@nestjs/config';
export interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
}
export interface RazorpayPaymentVerification {
    orderId: string;
    paymentId: string;
    signature: string;
}
export declare class RazorpayService {
    private readonly config;
    private readonly logger;
    private client;
    constructor(config: ConfigService);
    private isDummyMode;
    get publishableKeyId(): string;
    createOrder(params: {
        amountPaisa: number;
        currency: string;
        receipt: string;
        notes?: Record<string, string>;
    }): Promise<RazorpayOrder>;
    verifyPaymentSignature(verification: RazorpayPaymentVerification): boolean;
    verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
