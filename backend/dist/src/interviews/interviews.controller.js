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
exports.InterviewsController = void 0;
const common_1 = require("@nestjs/common");
const interviews_service_1 = require("./interviews.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let InterviewsController = class InterviewsController {
    constructor(interviewsService) {
        this.interviewsService = interviewsService;
    }
    async scheduleInterview(params) {
        return this.interviewsService.scheduleInterview(params);
    }
    async getInterview(companyApplicationId, talentApplicationId) {
        return this.interviewsService.getInterview(companyApplicationId, talentApplicationId);
    }
    async completeInterview(companyApplicationId, talentApplicationId, params) {
        return this.interviewsService.completeInterview(companyApplicationId, talentApplicationId, params);
    }
    async getUpcomingInterviews() {
        return this.interviewsService.getUpcomingInterviews();
    }
};
exports.InterviewsController = InterviewsController;
__decorate([
    (0, common_1.Post)('schedule'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "scheduleInterview", null);
__decorate([
    (0, common_1.Get)(':companyApplicationId/:talentApplicationId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('companyApplicationId')),
    __param(1, (0, common_1.Param)('talentApplicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getInterview", null);
__decorate([
    (0, common_1.Post)(':companyApplicationId/:talentApplicationId/complete'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('companyApplicationId')),
    __param(1, (0, common_1.Param)('talentApplicationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "completeInterview", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InterviewsController.prototype, "getUpcomingInterviews", null);
exports.InterviewsController = InterviewsController = __decorate([
    (0, common_1.Controller)('interviews'),
    __metadata("design:paramtypes", [interviews_service_1.InterviewsService])
], InterviewsController);
//# sourceMappingURL=interviews.controller.js.map