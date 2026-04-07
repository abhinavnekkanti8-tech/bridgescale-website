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
exports.SowTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const sow_templates_service_1 = require("./sow-templates.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let SowTemplatesController = class SowTemplatesController {
    constructor(sowTemplatesService) {
        this.sowTemplatesService = sowTemplatesService;
    }
    async getTemplates(type) {
        return this.sowTemplatesService.getTemplates(type ? { type } : undefined);
    }
    async getTemplate(id) {
        return this.sowTemplatesService.getTemplate(id);
    }
    async updateTemplate(id, updates) {
        return this.sowTemplatesService.updateTemplate(id, updates);
    }
    async duplicateTemplate(id) {
        return this.sowTemplatesService.duplicateTemplate(id);
    }
    async deactivateTemplate(id) {
        return this.sowTemplatesService.deactivateTemplate(id);
    }
    async extractPlaceholders(contentPlainText) {
        const placeholders = this.sowTemplatesService.extractPlaceholders(contentPlainText);
        return { placeholders };
    }
};
exports.SowTemplatesController = SowTemplatesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowTemplatesController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowTemplatesController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SowTemplatesController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowTemplatesController.prototype, "duplicateTemplate", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowTemplatesController.prototype, "deactivateTemplate", null);
__decorate([
    (0, common_1.Post)(':id/extract-placeholders'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Body)('contentPlainText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SowTemplatesController.prototype, "extractPlaceholders", null);
exports.SowTemplatesController = SowTemplatesController = __decorate([
    (0, common_1.Controller)('admin/sow-templates'),
    __metadata("design:paramtypes", [sow_templates_service_1.SowTemplatesService])
], SowTemplatesController);
//# sourceMappingURL=sow-templates.controller.js.map