"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationMatchingModule = void 0;
const common_1 = require("@nestjs/common");
const application_matching_controller_1 = require("./application-matching.controller");
const application_matching_service_1 = require("./application-matching.service");
let ApplicationMatchingModule = class ApplicationMatchingModule {
};
exports.ApplicationMatchingModule = ApplicationMatchingModule;
exports.ApplicationMatchingModule = ApplicationMatchingModule = __decorate([
    (0, common_1.Module)({
        controllers: [application_matching_controller_1.ApplicationMatchingController],
        providers: [application_matching_service_1.ApplicationMatchingService],
        exports: [application_matching_service_1.ApplicationMatchingService],
    })
], ApplicationMatchingModule);
//# sourceMappingURL=application-matching.module.js.map