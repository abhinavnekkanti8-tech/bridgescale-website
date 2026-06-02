import { OperatorRole, ServiceLane } from '@prisma/client';
import { assertEveryOperatorRoleHasLane, roleToLane } from './operator-roles';

describe('operator role lane mapping', () => {
  it('maps every operator role to exactly one service lane', () => {
    expect(() => assertEveryOperatorRoleHasLane()).not.toThrow();

    for (const role of Object.values(OperatorRole)) {
      expect(Object.values(ServiceLane)).toContain(roleToLane(role));
    }
  });

  it('keeps leadership, BD, and execution roles in their public lanes', () => {
    expect(roleToLane(OperatorRole.CRO)).toBe(ServiceLane.FRACTIONAL_LEADERSHIP);
    expect(roleToLane(OperatorRole.PARTNERSHIPS_LEAD)).toBe(ServiceLane.FRACTIONAL_BD_PARTNERSHIPS);
    expect(roleToLane(OperatorRole.REVOPS)).toBe(ServiceLane.FRACTIONAL_EXECUTION_OPS);
  });
});

