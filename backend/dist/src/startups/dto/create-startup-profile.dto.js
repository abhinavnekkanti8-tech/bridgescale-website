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
exports.CreateStartupProfileDto = exports.TargetMarket = exports.BudgetBand = exports.SalesMotion = exports.StartupStage = void 0;
const class_validator_1 = require("class-validator");
var StartupStage;
(function (StartupStage) {
    StartupStage["PRE_SEED"] = "PRE_SEED";
    StartupStage["SEED"] = "SEED";
    StartupStage["SERIES_A"] = "SERIES_A";
    StartupStage["SERIES_B_PLUS"] = "SERIES_B_PLUS";
    StartupStage["BOOTSTRAPPED"] = "BOOTSTRAPPED";
})(StartupStage || (exports.StartupStage = StartupStage = {}));
var SalesMotion;
(function (SalesMotion) {
    SalesMotion["OUTBOUND"] = "OUTBOUND";
    SalesMotion["INBOUND"] = "INBOUND";
    SalesMotion["PARTNER_LED"] = "PARTNER_LED";
    SalesMotion["PRODUCT_LED"] = "PRODUCT_LED";
    SalesMotion["BLENDED"] = "BLENDED";
})(SalesMotion || (exports.SalesMotion = SalesMotion = {}));
var BudgetBand;
(function (BudgetBand) {
    BudgetBand["UNDER_2K"] = "UNDER_2K";
    BudgetBand["TWO_TO_5K"] = "TWO_TO_5K";
    BudgetBand["FIVE_TO_10K"] = "FIVE_TO_10K";
    BudgetBand["ABOVE_10K"] = "ABOVE_10K";
})(BudgetBand || (exports.BudgetBand = BudgetBand = {}));
var TargetMarket;
(function (TargetMarket) {
    TargetMarket["EU"] = "EU";
    TargetMarket["US"] = "US";
    TargetMarket["AU"] = "AU";
    TargetMarket["REST_OF_WORLD"] = "REST_OF_WORLD";
})(TargetMarket || (exports.TargetMarket = TargetMarket = {}));
class CreateStartupProfileDto {
}
exports.CreateStartupProfileDto = CreateStartupProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateStartupProfileDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(StartupStage),
    __metadata("design:type", String)
], CreateStartupProfileDto.prototype, "stage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsEnum)(TargetMarket, { each: true }),
    __metadata("design:type", Array)
], CreateStartupProfileDto.prototype, "targetMarkets", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SalesMotion),
    __metadata("design:type", String)
], CreateStartupProfileDto.prototype, "salesMotion", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(BudgetBand),
    __metadata("design:type", String)
], CreateStartupProfileDto.prototype, "budgetBand", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStartupProfileDto.prototype, "executionOwner", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateStartupProfileDto.prototype, "hasProductDemo", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateStartupProfileDto.prototype, "hasDeck", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateStartupProfileDto.prototype, "toolingReady", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateStartupProfileDto.prototype, "responsivenessCommit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStartupProfileDto.prototype, "additionalContext", void 0);
//# sourceMappingURL=create-startup-profile.dto.js.map