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
exports.DiagnosesController = void 0;
const common_1 = require("@nestjs/common");
const diagnoses_service_1 = require("./diagnoses.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let DiagnosesController = class DiagnosesController {
    constructor(diagnosesService) {
        this.diagnosesService = diagnosesService;
    }
    async listDiagnoses(status, limit, offset) {
        return this.diagnosesService.listDiagnoses(status, limit ? parseInt(limit, 10) : 20, offset ? parseInt(offset, 10) : 0);
    }
    async getPendingDiagnoses() {
        return this.diagnosesService.getPendingDiagnoses();
    }
    async getDiagnosis(id) {
        return this.diagnosesService.getDiagnosis(id);
    }
    async updateDiagnosis(id, params) {
        return this.diagnosesService.updateDiagnosis(id, params);
    }
};
exports.DiagnosesController = DiagnosesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DiagnosesController.prototype, "listDiagnoses", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiagnosesController.prototype, "getPendingDiagnoses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DiagnosesController.prototype, "getDiagnosis", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DiagnosesController.prototype, "updateDiagnosis", null);
exports.DiagnosesController = DiagnosesController = __decorate([
    (0, common_1.Controller)('diagnoses'),
    __metadata("design:paramtypes", [diagnoses_service_1.DiagnosesService])
], DiagnosesController);
//# sourceMappingURL=diagnoses.controller.js.map