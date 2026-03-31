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
exports.SignContractDto = exports.EditSowDto = exports.GenerateSowDto = void 0;
const class_validator_1 = require("class-validator");
var PackageTypeDto;
(function (PackageTypeDto) {
    PackageTypeDto["PIPELINE_SPRINT"] = "PIPELINE_SPRINT";
    PackageTypeDto["BD_SPRINT"] = "BD_SPRINT";
    PackageTypeDto["FRACTIONAL_RETAINER"] = "FRACTIONAL_RETAINER";
})(PackageTypeDto || (PackageTypeDto = {}));
class GenerateSowDto {
}
exports.GenerateSowDto = GenerateSowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSowDto.prototype, "shortlistId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSowDto.prototype, "startupProfileId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateSowDto.prototype, "operatorId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PackageTypeDto),
    __metadata("design:type", String)
], GenerateSowDto.prototype, "packageType", void 0);
class EditSowDto {
}
exports.EditSowDto = EditSowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], EditSowDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], EditSowDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], EditSowDto.prototype, "deliverables", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], EditSowDto.prototype, "timeline", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EditSowDto.prototype, "weeklyHours", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EditSowDto.prototype, "totalPriceUsd", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EditSowDto.prototype, "changeNote", void 0);
class SignContractDto {
}
exports.SignContractDto = SignContractDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignContractDto.prototype, "signatureId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SignContractDto.prototype, "idempotencyKey", void 0);
//# sourceMappingURL=contracts.dto.js.map