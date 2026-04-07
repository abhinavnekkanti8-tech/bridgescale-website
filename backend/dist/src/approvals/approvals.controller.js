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
exports.ApprovalsController = void 0;
const common_1 = require("@nestjs/common");
const approvals_service_1 = require("./approvals.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ApprovalsController = class ApprovalsController {
    constructor(approvalsService) {
        this.approvalsService = approvalsService;
    }
    async approvePair(params) {
        return this.approvalsService.approvePair(params);
    }
    async rejectPair(params) {
        return this.approvalsService.rejectPair(params);
    }
    async getPairStatus(companyApplicationId, talentApplicationId) {
        return this.approvalsService.getPairStatus(companyApplicationId, talentApplicationId);
    }
    async getApprovedPairs() {
        return this.approvalsService.getApprovedPairs();
    }
};
exports.ApprovalsController = ApprovalsController;
__decorate([
    (0, common_1.Post)('approve-pair'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "approvePair", null);
__decorate([
    (0, common_1.Post)('reject-pair'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "rejectPair", null);
__decorate([
    (0, common_1.Get)(':companyApplicationId/:talentApplicationId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('companyApplicationId')),
    __param(1, (0, common_1.Param)('talentApplicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "getPairStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "getApprovedPairs", null);
exports.ApprovalsController = ApprovalsController = __decorate([
    (0, common_1.Controller)('approvals'),
    __metadata("design:paramtypes", [approvals_service_1.ApprovalsService])
], ApprovalsController);
//# sourceMappingURL=approvals.controller.js.map