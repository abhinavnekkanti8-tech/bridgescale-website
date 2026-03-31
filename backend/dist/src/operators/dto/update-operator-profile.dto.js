"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOperatorProfileDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_operator_profile_dto_1 = require("./create-operator-profile.dto");
class UpdateOperatorProfileDto extends (0, mapped_types_1.PartialType)(create_operator_profile_dto_1.CreateOperatorProfileDto) {
}
exports.UpdateOperatorProfileDto = UpdateOperatorProfileDto;
//# sourceMappingURL=update-operator-profile.dto.js.map