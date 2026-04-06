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
exports.OpportunityBriefsController = void 0;
const common_1 = require("@nestjs/common");
const opportunity_briefs_service_1 = require("./opportunity-briefs.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let OpportunityBriefsController = class OpportunityBriefsController {
    constructor(opportunityBriefsService) {
        this.opportunityBriefsService = opportunityBriefsService;
    }
    async getBrief(applicationId) {
        return this.opportunityBriefsService.getBriefByApplicationId(applicationId);
    }
    async generateBrief(applicationId) {
        return this.opportunityBriefsService.generateBrief(applicationId);
    }
    async updateBrief(applicationId, params) {
        return this.opportunityBriefsService.updateBrief(applicationId, params);
    }
};
exports.OpportunityBriefsController = OpportunityBriefsController;
__decorate([
    (0, common_1.Get)(':applicationId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN, client_1.MembershipRole.STARTUP_ADMIN),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OpportunityBriefsController.prototype, "getBrief", null);
__decorate([
    (0, common_1.Post)(':applicationId/generate'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('applicationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OpportunityBriefsController.prototype, "generateBrief", null);
__decorate([
    (0, common_1.Patch)(':applicationId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OpportunityBriefsController.prototype, "updateBrief", null);
exports.OpportunityBriefsController = OpportunityBriefsController = __decorate([
    (0, common_1.Controller)('opportunity-briefs'),
    __metadata("design:paramtypes", [opportunity_briefs_service_1.OpportunityBriefsService])
], OpportunityBriefsController);
//# sourceMappingURL=opportunity-briefs.controller.js.map