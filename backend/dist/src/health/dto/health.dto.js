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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEscalationDto = exports.CreateEscalationDto = exports.CreateNudgeDto = exports.UpdateHealthScoreDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateHealthScoreDto {
}
exports.UpdateHealthScoreDto = UpdateHealthScoreDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateHealthScoreDto.prototype, "scoreTotal", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateHealthScoreDto.prototype, "aiCommentary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateHealthScoreDto.prototype, "suggestedAction", void 0);
class CreateNudgeDto {
}
exports.CreateNudgeDto = CreateNudgeDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.NudgeType),
    __metadata("design:type", String)
], CreateNudgeDto.prototype, "nudgeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNudgeDto.prototype, "targetUserId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNudgeDto.prototype, "message", void 0);
class CreateEscalationDto {
}
exports.CreateEscalationDto = CreateEscalationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscalationDto.prototype, "engagementId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscalationDto.prototype, "reason", void 0);
class UpdateEscalationDto {
}
exports.UpdateEscalationDto = UpdateEscalationDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.EscalationStatus),
    __metadata("design:type", String)
], UpdateEscalationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEscalationDto.prototype, "resolutionNotes", void 0);
//# sourceMappingURL=health.dto.js.map