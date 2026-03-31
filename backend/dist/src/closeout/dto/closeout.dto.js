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
exports.GenerateRenewalDto = exports.SubmitRatingDto = exports.UpdateCloseoutDto = exports.GenerateCloseoutDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class GenerateCloseoutDto {
}
exports.GenerateCloseoutDto = GenerateCloseoutDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GenerateCloseoutDto.prototype, "publish", void 0);
class UpdateCloseoutDto {
}
exports.UpdateCloseoutDto = UpdateCloseoutDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCloseoutDto.prototype, "summary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCloseoutDto.prototype, "outcomes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCloseoutDto.prototype, "nextSteps", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.CloseoutStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCloseoutDto.prototype, "status", void 0);
class SubmitRatingDto {
}
exports.SubmitRatingDto = SubmitRatingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitRatingDto.prototype, "revieweeId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], SubmitRatingDto.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SubmitRatingDto.prototype, "components", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitRatingDto.prototype, "comments", void 0);
class GenerateRenewalDto {
}
exports.GenerateRenewalDto = GenerateRenewalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerateRenewalDto.prototype, "customContext", void 0);
//# sourceMappingURL=closeout.dto.js.map