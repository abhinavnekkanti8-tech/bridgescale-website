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
exports.CreateOperatorProfileDto = exports.TargetMarket = exports.OperatorLane = void 0;
const class_validator_1 = require("class-validator");
var OperatorLane;
(function (OperatorLane) {
    OperatorLane["PIPELINE_SPRINT"] = "PIPELINE_SPRINT";
    OperatorLane["BD_SPRINT"] = "BD_SPRINT";
    OperatorLane["FRACTIONAL_RETAINER"] = "FRACTIONAL_RETAINER";
})(OperatorLane || (exports.OperatorLane = OperatorLane = {}));
var TargetMarket;
(function (TargetMarket) {
    TargetMarket["EU"] = "EU";
    TargetMarket["US"] = "US";
    TargetMarket["AU"] = "AU";
    TargetMarket["REST_OF_WORLD"] = "REST_OF_WORLD";
})(TargetMarket || (exports.TargetMarket = TargetMarket = {}));
class CreateOperatorProfileDto {
}
exports.CreateOperatorProfileDto = CreateOperatorProfileDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsEnum)(OperatorLane, { each: true }),
    __metadata("design:type", Array)
], CreateOperatorProfileDto.prototype, "lanes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsEnum)(TargetMarket, { each: true }),
    __metadata("design:type", Array)
], CreateOperatorProfileDto.prototype, "regions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateOperatorProfileDto.prototype, "functions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateOperatorProfileDto.prototype, "experienceTags", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateOperatorProfileDto.prototype, "yearsExperience", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOperatorProfileDto.prototype, "linkedIn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateOperatorProfileDto.prototype, "references", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOperatorProfileDto.prototype, "availability", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOperatorProfileDto.prototype, "bio", void 0);
//# sourceMappingURL=create-operator-profile.dto.js.map