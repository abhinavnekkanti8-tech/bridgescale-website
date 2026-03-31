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
exports.OperatorsController = void 0;
const common_1 = require("@nestjs/common");
const operators_service_1 = require("./operators.service");
const create_operator_profile_dto_1 = require("./dto/create-operator-profile.dto");
const update_operator_profile_dto_1 = require("./dto/update-operator-profile.dto");
const create_invite_dto_1 = require("./dto/create-invite.dto");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class OverrideScoreDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], OverrideScoreDto.prototype, "scoreTotal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OverrideScoreDto.prototype, "overrideReason", void 0);
class AcceptInviteDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptInviteDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptInviteDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptInviteDto.prototype, "password", void 0);
let OperatorsController = class OperatorsController {
    constructor(operatorsService) {
        this.operatorsService = operatorsService;
    }
    createInvite(dto) {
        return this.operatorsService.createInvite(dto);
    }
    listInvites() {
        return this.operatorsService.listInvites();
    }
    revokeInvite(id) {
        return this.operatorsService.revokeInvite(id);
    }
    acceptInvite(dto) {
        return this.operatorsService.acceptInvite(dto.token, dto.name, dto.password);
    }
    createProfile(dto, user) {
        return this.operatorsService.createProfile(user.orgId, dto);
    }
    getMyProfile(user) {
        return this.operatorsService.findByOrgId(user.orgId);
    }
    updateProfile(id, dto, user) {
        return this.operatorsService.updateProfile(id, user.orgId, dto);
    }
    findAll() {
        return this.operatorsService.findAll();
    }
    findOne(id) {
        return this.operatorsService.findOne(id);
    }
    requestScore(id) {
        return this.operatorsService.requestScore(id);
    }
    getScores(id) {
        return this.operatorsService.getScores(id);
    }
    verifyOperator(id, action) {
        return this.operatorsService.verifyOperator(id, action);
    }
    overrideScore(scoreId, dto, user) {
        return this.operatorsService.overrideScore(scoreId, user, dto);
    }
};
exports.OperatorsController = OperatorsController;
__decorate([
    (0, common_1.Post)('invites'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_invite_dto_1.CreateInviteDto]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "createInvite", null);
__decorate([
    (0, common_1.Get)('invites'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "listInvites", null);
__decorate([
    (0, common_1.Patch)('invites/:id/revoke'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "revokeInvite", null);
__decorate([
    (0, common_1.Post)('invites/accept'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AcceptInviteDto]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Post)('profile'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OPERATOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_operator_profile_dto_1.CreateOperatorProfileDto, Object]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Get)('profile/me'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OPERATOR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('profile/:id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OPERATOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_operator_profile_dto_1.UpdateOperatorProfileDto, Object]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN, client_1.MembershipRole.OPERATOR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/score'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN, client_1.MembershipRole.OPERATOR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "requestScore", null);
__decorate([
    (0, common_1.Get)(':id/scores'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN, client_1.MembershipRole.OPERATOR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "getScores", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "verifyOperator", null);
__decorate([
    (0, common_1.Patch)('scores/:scoreId/override'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('scoreId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, OverrideScoreDto, Object]),
    __metadata("design:returntype", void 0)
], OperatorsController.prototype, "overrideScore", null);
exports.OperatorsController = OperatorsController = __decorate([
    (0, common_1.Controller)('operators'),
    __metadata("design:paramtypes", [operators_service_1.OperatorsService])
], OperatorsController);
//# sourceMappingURL=operators.controller.js.map