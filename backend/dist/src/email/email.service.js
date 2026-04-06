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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const templates_1 = require("./templates");
let EmailService = EmailService_1 = class EmailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.resend = null;
        const apiKey = this.config.get('EMAIL_API_KEY', '');
        this.fromAddress = this.config.get('EMAIL_FROM', 'noreply@bridgesales.com');
        this.isDummy = !apiKey || apiKey.includes('dummy') || apiKey.includes('replace');
        if (!this.isDummy) {
            try {
                const { Resend } = require('resend');
                this.resend = new Resend(apiKey);
                this.logger.log('Email service initialized with Resend provider.');
            }
            catch {
                this.logger.warn('Resend package not installed — falling back to console logging.');
                this.isDummy = true;
            }
        }
        else {
            this.logger.log('Email service running in DUMMY MODE — emails will be logged to console.');
        }
    }
    async sendApplicationReceived(application) {
        const { subject, html } = (0, templates_1.applicationReceivedEmail)({
            name: application.name,
            type: application.type,
            applicationId: application.id,
        });
        await this.send(application.email, subject, html);
    }
    async sendStatusUpdate(application, newStatus) {
        const { subject, html } = (0, templates_1.statusUpdateEmail)({
            name: application.name,
            applicationId: application.id,
            newStatus,
        });
        await this.send(application.email, subject, html);
    }
    async sendMagicLink(params) {
        const { subject, html } = (0, templates_1.magicLinkEmail)({
            name: params.name,
            magicUrl: params.magicUrl,
            expiryMinutes: params.expiryMinutes ?? 30,
        });
        await this.send(params.email, subject, html);
    }
    async sendDiagnosisGenerated(params) {
        const { subject, html } = (0, templates_1.diagnosisGeneratedEmail)({
            name: params.name,
            type: params.type,
            recommendedRole: params.recommendedRole,
        });
        await this.send(params.email, subject, html);
    }
    async sendDiagnosisApproved(params) {
        const { subject, html } = (0, templates_1.diagnosisApprovedEmail)({
            name: params.name,
            type: params.type,
        });
        await this.send(params.email, subject, html);
    }
    async send(to, subject, html) {
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
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${to}: ${err.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map