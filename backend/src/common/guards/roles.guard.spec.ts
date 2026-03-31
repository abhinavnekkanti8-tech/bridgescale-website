import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { MembershipRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (role: MembershipRole) => ({
    switchToHttp: () => ({
      getRequest: () => ({ session: { user: { role, id: 'u1', orgId: 'o1', email: 'a@b.com', name: 'Test' } } }),
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const ctx = createMockContext(MembershipRole.STARTUP_ADMIN) as any;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow PLATFORM_ADMIN regardless of required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([MembershipRole.STARTUP_ADMIN]);
    const ctx = createMockContext(MembershipRole.PLATFORM_ADMIN) as any;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([MembershipRole.OPERATOR]);
    const ctx = createMockContext(MembershipRole.OPERATOR) as any;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([MembershipRole.PLATFORM_ADMIN]);
    const ctx = createMockContext(MembershipRole.STARTUP_MEMBER) as any;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
