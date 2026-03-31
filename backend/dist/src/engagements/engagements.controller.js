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
exports.EngagementsController = void 0;
const common_1 = require("@nestjs/common");
const engagements_service_1 = require("./engagements.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const session_user_decorator_1 = require("../auth/session-user.decorator");
const engagements_dto_1 = require("./dto/engagements.dto");
let EngagementsController = class EngagementsController {
    constructor(service) {
        this.service = service;
    }
    initialize(contractId) {
        return this.service.initializeEngagement(contractId);
    }
    getForStartup(user) {
        return this.service.findByStartup(user.organizationId);
    }
    getForOperator(user) {
        return this.service.findByOperator(user.id);
    }
    getOne(id) {
        return this.service.getEngagement(id);
    }
    getWorkspace(id) {
        return this.service.getWorkspaceData(id);
    }
    updateStatus(id, dto, user) {
        return this.service.updateStatus(id, dto, user.id);
    }
    createMilestone(id, dto, user) {
        return this.service.createMilestone(id, dto, user.id);
    }
    updateMilestone(milestoneId, dto, user) {
        return this.service.updateMilestone(milestoneId, dto, user.id);
    }
    addNote(id, dto, user) {
        return this.service.addNote(id, dto, user.id);
    }
};
exports.EngagementsController = EngagementsController;
__decorate([
    (0, common_1.Post)(':contractId/initialize'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('contractId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "initialize", null);
__decorate([
    (0, common_1.Get)('startup'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.STARTUP_ADMIN, client_1.MembershipRole.STARTUP_MEMBER),
    __param(0, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "getForStartup", null);
__decorate([
    (0, common_1.Get)('operator'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OPERATOR),
    __param(0, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "getForOperator", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)(':id/workspace'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "getWorkspace", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, engagements_dto_1.UpdateEngagementStatusDto, Object]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/milestones'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OPERATOR, client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, engagements_dto_1.CreateMilestoneDto, Object]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "createMilestone", null);
__decorate([
    (0, common_1.Patch)('milestones/:milestoneId'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OPERATOR, client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('milestoneId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, engagements_dto_1.UpdateMilestoneDto, Object]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "updateMilestone", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, engagements_dto_1.CreateNoteDto, Object]),
    __metadata("design:returntype", void 0)
], EngagementsController.prototype, "addNote", null);
exports.EngagementsController = EngagementsController = __decorate([
    (0, common_1.Controller)('engagements'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [engagements_service_1.EngagementsService])
], EngagementsController);
//# sourceMappingURL=engagements.controller.js.map