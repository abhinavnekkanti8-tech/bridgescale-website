"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseoutModule = void 0;
const common_1 = require("@nestjs/common");
const closeout_controller_1 = require("./closeout.controller");
const closeout_service_1 = require("./closeout.service");
const ai_module_1 = require("../ai/ai.module");
let CloseoutModule = class CloseoutModule {
};
exports.CloseoutModule = CloseoutModule;
exports.CloseoutModule = CloseoutModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_module_1.AiModule],
        controllers: [closeout_controller_1.CloseoutController],
        providers: [closeout_service_1.CloseoutService],
        exports: [closeout_service_1.CloseoutService],
    })
], CloseoutModule);
//# sourceMappingURL=closeout.module.js.map