"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RazorpayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let RazorpayService = RazorpayService_1 = class RazorpayService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RazorpayService_1.name);
        const keyId = this.config.get('RAZORPAY_KEY_ID', '');
        const keySecret = this.config.get('RAZORPAY_KEY_SECRET', '');
        if (!this.isDummyMode() && keyId && keySecret && !keyId.startsWith('rzp_test_dummy')) {
            const Razorpay = require('razorpay');
            this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
            this.logger.log('Razorpay client initialized (LIVE)');
        }
        else {
            this.logger.log('Razorpay running in DUMMY mode — no real orders will be created');
        }
    }
    isDummyMode() {
        return this.config.get('DUMMY_PAYMENT_MODE', 'true') === 'true';
    }
    get publishableKeyId() {
        return this.config.get('RAZORPAY_KEY_ID', 'rzp_test_dummy');
    }
    async createOrder(params) {
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
        return order;
    }
    verifyPaymentSignature(verification) {
        if (this.isDummyMode() || !this.client) {
            const isAutoApproved = verification.paymentId.startsWith('pay_dummy');
            this.logger.log(`[DUMMY] Signature verification: ${isAutoApproved ? 'PASSED' : 'FAILED'} for ${verification.paymentId}`);
            return isAutoApproved;
        }
        const secret = this.config.get('RAZORPAY_KEY_SECRET', '');
        const body = `${verification.orderId}|${verification.paymentId}`;
        const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
        const valid = expected === verification.signature;
        this.logger.log(`Razorpay signature verification for ${verification.paymentId}: ${valid ? 'VALID' : 'INVALID'}`);
        return valid;
    }
    verifyWebhookSignature(rawBody, signature) {
        if (this.isDummyMode())
            return true;
        const webhookSecret = this.config.get('RAZORPAY_WEBHOOK_SECRET', '');
        const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
        return expected === signature;
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = RazorpayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map