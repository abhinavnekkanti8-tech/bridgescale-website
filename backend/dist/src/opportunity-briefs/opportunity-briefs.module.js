"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityBriefsModule = void 0;
const common_1 = require("@nestjs/common");
const opportunity_briefs_controller_1 = require("./opportunity-briefs.controller");
const opportunity_briefs_service_1 = require("./opportunity-briefs.service");
let OpportunityBriefsModule = class OpportunityBriefsModule {
};
exports.OpportunityBriefsModule = OpportunityBriefsModule;
exports.OpportunityBriefsModule = OpportunityBriefsModule = __decorate([
    (0, common_1.Module)({
        controllers: [opportunity_briefs_controller_1.OpportunityBriefsController],
        providers: [opportunity_briefs_service_1.OpportunityBriefsService],
        exports: [opportunity_briefs_service_1.OpportunityBriefsService],
    })
], OpportunityBriefsModule);
//# sourceMappingURL=opportunity-briefs.module.js.map