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
exports.UpdateInvoiceStatusDto = exports.IssueInvoiceDto = exports.CreatePaymentPlanDto = exports.PaymentPlanTypeDto = void 0;
const class_validator_1 = require("class-validator");
var PaymentPlanTypeDto;
(function (PaymentPlanTypeDto) {
    PaymentPlanTypeDto["CASH_SPRINT_FEE"] = "CASH_SPRINT_FEE";
    PaymentPlanTypeDto["MONTHLY_RETAINER"] = "MONTHLY_RETAINER";
    PaymentPlanTypeDto["SUCCESS_FEE_ADDENDUM"] = "SUCCESS_FEE_ADDENDUM";
})(PaymentPlanTypeDto || (exports.PaymentPlanTypeDto = PaymentPlanTypeDto = {}));
class CreatePaymentPlanDto {
}
exports.CreatePaymentPlanDto = CreatePaymentPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentPlanDto.prototype, "contractId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentPlanTypeDto),
    __metadata("design:type", String)
], CreatePaymentPlanDto.prototype, "planType", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100),
    __metadata("design:type", Number)
], CreatePaymentPlanDto.prototype, "totalAmountUsd", void 0);
class IssueInvoiceDto {
}
exports.IssueInvoiceDto = IssueInvoiceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueInvoiceDto.prototype, "paymentPlanId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], IssueInvoiceDto.prototype, "amountUsd", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueInvoiceDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], IssueInvoiceDto.prototype, "dueDate", void 0);
class UpdateInvoiceStatusDto {
}
exports.UpdateInvoiceStatusDto = UpdateInvoiceStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED']),
    __metadata("design:type", String)
], UpdateInvoiceStatusDto.prototype, "status", void 0);
//# sourceMappingURL=payments.dto.js.map