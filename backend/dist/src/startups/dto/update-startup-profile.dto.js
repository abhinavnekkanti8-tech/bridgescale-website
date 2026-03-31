"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStartupProfileDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_startup_profile_dto_1 = require("./create-startup-profile.dto");
class UpdateStartupProfileDto extends (0, mapped_types_1.PartialType)(create_startup_profile_dto_1.CreateStartupProfileDto) {
}
exports.UpdateStartupProfileDto = UpdateStartupProfileDto;
//# sourceMappingURL=update-startup-profile.dto.js.map