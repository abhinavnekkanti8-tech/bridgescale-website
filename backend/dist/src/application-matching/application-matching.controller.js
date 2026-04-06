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
exports.ApplicationMatchingController = void 0;
const common_1 = require("@nestjs/common");
const application_matching_service_1 = require("./application-matching.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ApplicationMatchingController = class ApplicationMatchingController {
    constructor(matchingService) {
        this.matchingService = matchingService;
    }
    async createShortlist(companyApplicationId, params) {
        return this.matchingService.createShortlist(companyApplicationId, params);
    }
    async getShortlist(shortlistId) {
        return this.matchingService.getShortlist(shortlistId);
    }
    async addCandidate(shortlistId, talentApplicationId, params) {
        return this.matchingService.addCandidateToShortlist(shortlistId, talentApplicationId, params);
    }
    async updateCandidate(candidateId, params) {
        return this.matchingService.updateCandidate(candidateId, params);
    }
    async getTopCandidates(shortlistId) {
        return this.matchingService.getTopCandidates(shortlistId);
    }
};
exports.ApplicationMatchingController = ApplicationMatchingController;
__decorate([
    (0, common_1.Post)(':companyApplicationId/shortlist'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('companyApplicationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationMatchingController.prototype, "createShortlist", null);
__decorate([
    (0, common_1.Get)('shortlist/:shortlistId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('shortlistId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationMatchingController.prototype, "getShortlist", null);
__decorate([
    (0, common_1.Post)('shortlist/:shortlistId/candidates/:talentApplicationId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('shortlistId')),
    __param(1, (0, common_1.Param)('talentApplicationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationMatchingController.prototype, "addCandidate", null);
__decorate([
    (0, common_1.Patch)('candidate/:candidateId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('candidateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationMatchingController.prototype, "updateCandidate", null);
__decorate([
    (0, common_1.Get)('shortlist/:shortlistId/top'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('shortlistId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicationMatchingController.prototype, "getTopCandidates", null);
exports.ApplicationMatchingController = ApplicationMatchingController = __decorate([
    (0, common_1.Controller)('application-matches'),
    __metadata("design:paramtypes", [application_matching_service_1.ApplicationMatchingService])
], ApplicationMatchingController);
//# sourceMappingURL=application-matching.controller.js.map