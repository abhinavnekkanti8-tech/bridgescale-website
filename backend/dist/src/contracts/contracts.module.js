"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsModule = void 0;
const common_1 = require("@nestjs/common");
const contracts_controller_1 = require("./contracts.controller");
const contracts_service_1 = require("./contracts.service");
const sow_templates_controller_1 = require("./sow-templates.controller");
const sow_templates_service_1 = require("./sow-templates.service");
let ContractsModule = class ContractsModule {
};
exports.ContractsModule = ContractsModule;
exports.ContractsModule = ContractsModule = __decorate([
    (0, common_1.Module)({
        controllers: [contracts_controller_1.ContractsController, sow_templates_controller_1.SowTemplatesController],
        providers: [contracts_service_1.ContractsService, sow_templates_service_1.SowTemplatesService],
        exports: [contracts_service_1.ContractsService, sow_templates_service_1.SowTemplatesService],
    })
], ContractsModule);
//# sourceMappingURL=contracts.module.js.map