import { OperatorRole, ServiceLane } from '@prisma/client';

export const OPERATOR_ROLE_TO_LANE: Record<OperatorRole, ServiceLane> = {
  [OperatorRole.VP_SALES]: ServiceLane.FRACTIONAL_LEADERSHIP,
  [OperatorRole.VP_REVENUE]: ServiceLane.FRACTIONAL_LEADERSHIP,
  [OperatorRole.CRO]: ServiceLane.FRACTIONAL_LEADERSHIP,
  [OperatorRole.HEAD_OF_SALES]: ServiceLane.FRACTIONAL_LEADERSHIP,
  [OperatorRole.GTM_LEADER]: ServiceLane.FRACTIONAL_LEADERSHIP,
  [OperatorRole.FOUNDER_LED_SALES_COACH]: ServiceLane.FRACTIONAL_LEADERSHIP,
  [OperatorRole.REVENUE_ADVISOR]: ServiceLane.FRACTIONAL_LEADERSHIP,
  [OperatorRole.BD_LEAD]: ServiceLane.FRACTIONAL_BD_PARTNERSHIPS,
  [OperatorRole.PARTNERSHIPS_LEAD]: ServiceLane.FRACTIONAL_BD_PARTNERSHIPS,
  [OperatorRole.CHANNEL_LEAD]: ServiceLane.FRACTIONAL_BD_PARTNERSHIPS,
  [OperatorRole.ALLIANCES_LEAD]: ServiceLane.FRACTIONAL_BD_PARTNERSHIPS,
  [OperatorRole.MARKET_ACCESS_LEAD]: ServiceLane.FRACTIONAL_BD_PARTNERSHIPS,
  [OperatorRole.AE]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.SDR]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.BDR]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.OUTBOUND_OPERATOR]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.REVOPS]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.SALES_OPS]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.CUSTOMER_SUCCESS_OPERATOR]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.EXPANSION_OPERATOR]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.ACCOUNT_MANAGER]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
  [OperatorRole.SALES_ENABLEMENT_SOLUTIONS_CONSULTANT]: ServiceLane.FRACTIONAL_EXECUTION_OPS,
};

export function roleToLane(role: OperatorRole): ServiceLane {
  return OPERATOR_ROLE_TO_LANE[role];
}

export function assertEveryOperatorRoleHasLane() {
  const missing = Object.values(OperatorRole).filter((role) => !OPERATOR_ROLE_TO_LANE[role]);
  if (missing.length > 0) {
    throw new Error(`Operator roles missing lane mapping: ${missing.join(', ')}`);
  }
}

