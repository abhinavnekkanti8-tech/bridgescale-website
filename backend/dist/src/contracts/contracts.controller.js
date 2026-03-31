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
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const contracts_service_1 = require("./contracts.service");
const contracts_dto_1 = require("./dto/contracts.dto");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ContractsController = class ContractsController {
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    generateSow(dto) {
        return this.contractsService.generateSow(dto);
    }
    findAll() {
        return this.contractsService.findAll();
    }
    findOneSow(id) {
        return this.contractsService.findOneSow(id);
    }
    getSowVersions(id) {
        return this.contractsService.getSowVersions(id);
    }
    editSow(id, dto, req) {
        return this.contractsService.editSow(id, dto, req.user?.id ?? 'unknown');
    }
    submitForReview(id) {
        return this.contractsService.submitForReview(id);
    }
    approveSow(id) {
        return this.contractsService.approveSow(id);
    }
    findByStartup(id) {
        return this.contractsService.findByStartup(id);
    }
    findByOperator(id) {
        return this.contractsService.findByOperator(id);
    }
    findOneContract(id) {
        return this.contractsService.findOneContract(id);
    }
    signStartup(id, dto) {
        return this.contractsService.signContract(id, 'STARTUP', dto);
    }
    signOperator(id, dto) {
        return this.contractsService.signContract(id, 'OPERATOR', dto);
    }
    unlockContacts(id) {
        return this.contractsService.unlockContacts(id);
    }
    getDocumentLogs(id) {
        return this.contractsService.getDocumentLogs(id);
    }
    logDownload(id, req) {
        return this.contractsService.logDocumentAction(id, 'DOWNLOAD', req.user?.id ?? 'unknown', req.ip, req.headers?.['user-agent']);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)('sow'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contracts_dto_1.GenerateSowDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "generateSow", null);
__decorate([
    (0, common_1.Get)('sow'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('sow/:id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findOneSow", null);
__decorate([
    (0, common_1.Get)('sow/:id/versions'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "getSowVersions", null);
__decorate([
    (0, common_1.Patch)('sow/:id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contracts_dto_1.EditSowDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "editSow", null);
__decorate([
    (0, common_1.Patch)('sow/:id/submit'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "submitForReview", null);
__decorate([
    (0, common_1.Patch)('sow/:id/approve'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "approveSow", null);
__decorate([
    (0, common_1.Get)('sow/startup/:startupProfileId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('startupProfileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findByStartup", null);
__decorate([
    (0, common_1.Get)('sow/operator/:operatorId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('operatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findByOperator", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findOneContract", null);
__decorate([
    (0, common_1.Post)(':id/sign/startup'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.STARTUP_ADMIN, client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contracts_dto_1.SignContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "signStartup", null);
__decorate([
    (0, common_1.Post)(':id/sign/operator'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OPERATOR, client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contracts_dto_1.SignContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "signOperator", null);
__decorate([
    (0, common_1.Patch)(':id/unlock-contacts'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "unlockContacts", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.PLATFORM_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "getDocumentLogs", null);
__decorate([
    (0, common_1.Post)(':id/log-download'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "logDownload", null);
exports.ContractsController = ContractsController = __decorate([
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map