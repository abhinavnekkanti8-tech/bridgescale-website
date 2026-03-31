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
exports.StartupsController = void 0;
const common_1 = require("@nestjs/common");
const startups_service_1 = require("./startups.service");
const create_startup_profile_dto_1 = require("./dto/create-startup-profile.dto");
const update_startup_profile_dto_1 = require("./dto/update-startup-profile.dto");
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
let StartupsController = class StartupsController {
    constructor(startupsService) {
        this.startupsService = startupsService;
    }
    async create(dto, user) {
        return this.startupsService.create(user.orgId, dto);
    }
    async update(id, dto, user) {
        return this.startupsService.update(id, user.orgId, dto);
    }
    async getMyProfile(user) {
        return this.startupsService.findByOrgId(user.orgId);
    }
    async findAll() {
        return this.startupsService.findAll();
    }
    async findOne(id) {
        return this.startupsService.findOne(id);
    }
    async requestScore(id) {
        return this.startupsService.requestScore(id);
    }
    async getScores(id) {
        return this.startupsService.getScores(id);
    }
    async overrideScore(scoreId, dto, user) {
        return this.startupsService.overrideScore(scoreId, user, dto);
    }
};
exports.StartupsController = StartupsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.STARTUP_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_startup_profile_dto_1.CreateStartupProfileDto, Object]),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.STARTUP_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_startup_profile_dto_1.UpdateStartupProfileDto, Object]),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.STARTUP_ADMIN, client_1.MembershipRole.STARTUP_MEMBER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/score'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.STARTUP_ADMIN, client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "requestScore", null);
__decorate([
    (0, common_1.Get)(':id/scores'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.STARTUP_ADMIN, client_1.MembershipRole.STARTUP_MEMBER, client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "getScores", null);
__decorate([
    (0, common_1.Patch)('scores/:scoreId/override'),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('scoreId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, OverrideScoreDto, Object]),
    __metadata("design:returntype", Promise)
], StartupsController.prototype, "overrideScore", null);
exports.StartupsController = StartupsController = __decorate([
    (0, common_1.Controller)('startups'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [startups_service_1.StartupsService])
], StartupsController);
//# sourceMappingURL=startups.controller.js.map