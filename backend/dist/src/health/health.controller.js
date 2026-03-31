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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const health_service_1 = require("./health.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const session_user_decorator_1 = require("../auth/session-user.decorator");
const health_dto_1 = require("./dto/health.dto");
let HealthController = class HealthController {
    constructor(prisma, healthService) {
        this.prisma = prisma;
        this.healthService = healthService;
    }
    async check() {
        const result = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                database: { status: 'up' },
            },
        };
        try {
            const start = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            result.services.database = { status: 'up', latencyMs: Date.now() - start };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            result.services.database = { status: 'down', error: message };
            result.status = 'degraded';
        }
        return result;
    }
    getSnapshots(id) {
        return this.healthService.getAllSnapshots(id);
    }
    recalculate(id) {
        return this.healthService.recalculateHealth(id);
    }
    getMyNudges(user) {
        return this.healthService.getMyNudges(user.id);
    }
    markNudgeRead(id) {
        return this.healthService.markNudgeRead(id);
    }
    createNudge(id, dto) {
        return this.healthService.createNudge(id, dto);
    }
    createEscalation(dto, user) {
        return this.healthService.createEscalation(user.id, dto);
    }
    getOpenEscalations() {
        return this.healthService.getOpenEscalations();
    }
    updateEscalationStatus(id, dto) {
        return this.healthService.updateEscalationStatus(id, dto);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('engagements/:id/snapshots'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getSnapshots", null);
__decorate([
    (0, common_1.Post)('engagements/:id/recalculate'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "recalculate", null);
__decorate([
    (0, common_1.Get)('nudges'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getMyNudges", null);
__decorate([
    (0, common_1.Patch)('nudges/:id/read'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "markNudgeRead", null);
__decorate([
    (0, common_1.Post)('engagements/:id/nudges'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, health_dto_1.CreateNudgeDto]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "createNudge", null);
__decorate([
    (0, common_1.Post)('escalate'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [health_dto_1.CreateEscalationDto, Object]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "createEscalation", null);
__decorate([
    (0, common_1.Get)('escalations'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getOpenEscalations", null);
__decorate([
    (0, common_1.Patch)('escalations/:id/status'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, health_dto_1.UpdateEscalationDto]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "updateEscalationStatus", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map