import { MembershipRole } from '@prisma/client';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { ComplianceController } from './compliance.controller';

describe('ComplianceController authorization', () => {
  it('restricts the compliance controller to platform admins', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, ComplianceController);
    expect(roles).toEqual([MembershipRole.PLATFORM_ADMIN]);
  });
});
