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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const applications_service_1 = require("./applications.service");
const create_application_dto_1 = require("./dto/create-application.dto");
const payment_dto_1 = require("./dto/payment.dto");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const UPLOADS_DIR = (0, path_1.join)(process.cwd(), 'uploads', 'cv');
if (!(0, fs_1.existsSync)(UPLOADS_DIR)) {
    (0, fs_1.mkdirSync)(UPLOADS_DIR, { recursive: true });
}
let ApplicationsController = class ApplicationsController {
    constructor(applicationsService) {
        this.applicationsService = applicationsService;
    }
    async createApplication(dto) {
        return this.applicationsService.createApplication(dto);
    }
    async getMyApplication(user) {
        if (!user)
            throw new common_1.BadRequestException('User not authenticated.');
        return this.applicationsService.getMyApplication(user.email);
    }
    async verifyRazorpayPayment(dto) {
        return this.applicationsService.verifyRazorpayPayment({
            applicationId: dto.applicationId,
            razorpayOrderId: dto.razorpayOrderId,
            razorpayPaymentId: dto.razorpayPaymentId,
            razorpaySignature: dto.razorpaySignature,
        });
    }
    async dummyConfirmPayment(dto) {
        return this.applicationsService.dummyConfirmPayment(dto.applicationId);
    }
    async handleRazorpayWebhook(req, signature, payload) {
        const rawBody = (req.rawBody ?? Buffer.alloc(0)).toString('utf-8');
        return this.applicationsService.handleRazorpayWebhook(rawBody, signature ?? '', payload);
    }
    async getApplicationStatus(id) {
        return this.applicationsService.getApplicationStatus(id);
    }
    async listApplications(status) {
        return this.applicationsService.listApplications(status);
    }
    async updateApplicationStatus(id, status) {
        if (!Object.values(client_1.ApplicationStatus).includes(status)) {
            throw new common_1.BadRequestException(`Invalid status: ${status}`);
        }
        return this.applicationsService.updateApplicationStatus(id, status);
    }
    async uploadCv(id, file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded.');
        return this.applicationsService.attachCv(id, file.originalname, `/uploads/cv/${file.filename}`);
    }
    async handleStripeWebhook(payload) {
        if (!payload || payload.type !== 'checkout.session.completed')
            return { received: true };
        const session = payload.data?.object;
        if (!session?.id)
            return { received: true };
        return this.applicationsService.handleCheckoutCompleted(session.id, session.payment_intent || '');
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_application_dto_1.CreateApplicationDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "createApplication", null);
__decorate([
    (0, common_1.Get)('my-application'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMyApplication", null);
__decorate([
    (0, common_1.Post)('payment/razorpay/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.VerifyRazorpayDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "verifyRazorpayPayment", null);
__decorate([
    (0, common_1.Post)('payment/dummy-confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.DummyConfirmDto]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "dummyConfirmPayment", null);
__decorate([
    (0, common_1.Post)('payment/razorpay/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-razorpay-signature')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "handleRazorpayWebhook", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getApplicationStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "listApplications", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "updateApplicationStatus", null);
__decorate([
    (0, common_1.Post)(':id/upload-cv'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('cv', {
        storage: (0, multer_1.diskStorage)({
            destination: UPLOADS_DIR,
            filename: (_req, file, cb) => {
                cb(null, `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname).toLowerCase()}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            if (allowed.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Only PDF, DOC, and DOCX files are allowed.'), false);
            }
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "uploadCv", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "handleStripeWebhook", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map