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
exports.SowController = void 0;
const common_1 = require("@nestjs/common");
const sow_service_1 = require("./sow.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let SowController = class SowController {
    constructor(sowService) {
        this.sowService = sowService;
    }
    async getTemplates() {
        return this.sowService.getTemplates();
    }
    async getTemplate(templateId) {
        return this.sowService.getTemplate(templateId);
    }
    async getSoW(sowId) {
        return this.sowService.getSoW(sowId);
    }
    async generateSoW(params) {
        return this.sowService.generateSoW(params);
    }
    async updateSoW(sowId, body) {
        return this.sowService.updateSoW(sowId, body.contentText, body.changedBy, body.changeNote);
    }
    async approveSoW(sowId) {
        return this.sowService.approveSoW(sowId);
    }
};
exports.SowController = SowController;
__decorate([
    (0, common_1.Get)('templates'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SowController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:templateId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Get)(':sowId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('sowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowController.prototype, "getSoW", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SowController.prototype, "generateSoW", null);
__decorate([
    (0, common_1.Patch)(':sowId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('sowId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SowController.prototype, "updateSoW", null);
__decorate([
    (0, common_1.Post)(':sowId/approve'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('sowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowController.prototype, "approveSoW", null);
exports.SowController = SowController = __decorate([
    (0, common_1.Controller)('sow'),
    __metadata("design:paramtypes", [sow_service_1.SowService])
], SowController);
//# sourceMappingURL=sow.controller.js.map