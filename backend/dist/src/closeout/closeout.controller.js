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
exports.CloseoutController = void 0;
const common_1 = require("@nestjs/common");
const closeout_service_1 = require("./closeout.service");
const session_auth_guard_1 = require("../common/guards/session-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const session_user_decorator_1 = require("../auth/session-user.decorator");
const closeout_dto_1 = require("./dto/closeout.dto");
let CloseoutController = class CloseoutController {
    constructor(service) {
        this.service = service;
    }
    getReport(id) {
        return this.service.getReport(id);
    }
    generateReport(id) {
        return this.service.generateReport(id);
    }
    updateReport(id, dto) {
        return this.service.updateReport(id, dto);
    }
    getRatings(id) {
        return this.service.getEngagementRatings(id);
    }
    submitRating(id, dto, user) {
        return this.service.submitRating(id, user.id, dto);
    }
    getRenewal(id) {
        return this.service.getRenewalRecommendation(id);
    }
    generateRenewal(id) {
        return this.service.generateRenewalRecommendation(id);
    }
};
exports.CloseoutController = CloseoutController;
__decorate([
    (0, common_1.Get)('closeout'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CloseoutController.prototype, "getReport", null);
__decorate([
    (0, common_1.Post)('closeout/generate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CloseoutController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Patch)('closeout'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, closeout_dto_1.UpdateCloseoutDto]),
    __metadata("design:returntype", void 0)
], CloseoutController.prototype, "updateReport", null);
__decorate([
    (0, common_1.Get)('ratings'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CloseoutController.prototype, "getRatings", null);
__decorate([
    (0, common_1.Post)('ratings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, session_user_decorator_1.SessionUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, closeout_dto_1.SubmitRatingDto, Object]),
    __metadata("design:returntype", void 0)
], CloseoutController.prototype, "submitRating", null);
__decorate([
    (0, common_1.Get)('renewal'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CloseoutController.prototype, "getRenewal", null);
__decorate([
    (0, common_1.Post)('renewal/generate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CloseoutController.prototype, "generateRenewal", null);
exports.CloseoutController = CloseoutController = __decorate([
    (0, common_1.Controller)('engagements/:id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [closeout_service_1.CloseoutService])
], CloseoutController);
//# sourceMappingURL=closeout.controller.js.map