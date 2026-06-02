/**
 * Phase 1 validation — diff the canonical Operating Matrix (sheet 06_Combinations)
 * against the seeded `RoleTemplateEngagementCombination` rows.
 *
 * Run:
 *   cd backend && npx ts-node scripts/validate-matrix.ts
 *
 * Reads `BridgeScale_Operating_Matrix.xlsx` from the repo root, hits the live
 * dev DB, and prints three lists:
 *   1. Combinations in the matrix but missing from the seed (gaps to add).
 *   2. Combinations in the seed but missing from the matrix (over-permissive).
 *   3. Recommended next action (typically: tighten the seed to match the
 *      curated matrix, or extend the matrix once founder + legal sign off).
 *
 * Requires `xlsx` npm package (already a transitive dep via `@prisma/client`'s
 * tooling, otherwise install with `npm i -D xlsx`).
 */
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEMPLATE_NAME_TO_CODE: Record<string, string> = {
  'gtm strategy': 'GTM_STRATEGY',
  'icp refinement': 'ICP_REFINEMENT',
  'international market entry': 'INTL_MARKET_ENTRY',
  'pipeline sprint': 'PIPELINE_SPRINT',
  'founder-led sales transition': 'FOUNDER_LED_SALES_TRANSITION',
  'revenue cadence setup': 'REVENUE_CADENCE_SETUP',
  'partner / channel development': 'PARTNER_CHANNEL_DEVELOPMENT',
  'customer success / retention': 'CUSTOMER_SUCCESS_RETENTION',
  'sales process / crm cleanup': 'SALES_PROCESS_CRM_CLEANUP',
  'closing support': 'CLOSING_SUPPORT',
};

const ENGAGEMENT_TO_TYPE: Record<string, string | null> = {
  consultation: 'CONSULTATION',
  sprint: 'SPRINT',
  retainer: 'RETAINER',
  'fractional leadership': 'RETAINER',
  'full-time conversion (lifecycle event)': null,
};

const ROLE_NAME_TO_CODES: Record<string, string[] | null> = {
  'vp sales': ['VP_SALES'], 'vp revenue': ['VP_REVENUE'], 'cro': ['CRO'],
  'head of sales': ['HEAD_OF_SALES'], 'gtm leader': ['GTM_LEADER'],
  'founder-led sales coach': ['FOUNDER_LED_SALES_COACH'], 'revenue advisor': ['REVENUE_ADVISOR'],
  'bd lead': ['BD_LEAD'], 'partnerships lead': ['PARTNERSHIPS_LEAD'],
  'channel lead': ['CHANNEL_LEAD'], 'alliances lead': ['ALLIANCES_LEAD'],
  'market access lead': ['MARKET_ACCESS_LEAD'],
  'ae': ['AE'], 'sdr': ['SDR'], 'bdr': ['BDR'], 'sdr / bdr': ['SDR', 'BDR'],
  'outbound operator': ['OUTBOUND_OPERATOR'],
  'revops': ['REVOPS'], 'sales ops': ['SALES_OPS'], 'revops / sales ops': ['REVOPS', 'SALES_OPS'],
  'customer success operator': ['CUSTOMER_SUCCESS_OPERATOR'],
  'expansion operator': ['EXPANSION_OPERATOR'], 'account manager': ['ACCOUNT_MANAGER'],
  'sales enablement & solutions consultant': ['SALES_ENABLEMENT_SOLUTIONS_CONSULTANT'],
  any: null,
};

async function main() {
  const xlsxPath = path.resolve(__dirname, '../../BridgeScale_Operating_Matrix.xlsx');
  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets['06_Combinations'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  const matrix = new Set<string>();
  for (const row of rows.slice(4)) {
    const [roleField, templateField, engagementField] = row;
    if (!roleField || roleField === 'Any') continue;
    const templateCode = TEMPLATE_NAME_TO_CODE[String(templateField).toLowerCase().trim()];
    const engagementType = ENGAGEMENT_TO_TYPE[String(engagementField).toLowerCase().trim()];
    if (!templateCode || !engagementType) continue;
    const wholeRole = String(roleField).toLowerCase().trim();
    let codes: string[] = [];
    if (ROLE_NAME_TO_CODES[wholeRole]) {
      codes = ROLE_NAME_TO_CODES[wholeRole]!;
    } else {
      codes = String(roleField)
        .split('/')
        .flatMap((p) => ROLE_NAME_TO_CODES[p.trim().toLowerCase()] ?? []);
    }
    for (const r of codes) matrix.add(`${r}|${templateCode}|${engagementType}`);
  }

  const seededRows = await prisma.roleTemplateEngagementCombination.findMany({
    select: { operatorRole: true, serviceTemplate: true, engagementType: true },
  });
  const seeded = new Set(seededRows.map((r) => `${r.operatorRole}|${r.serviceTemplate}|${r.engagementType}`));

  const missingFromSeed = [...matrix].filter((k) => !seeded.has(k)).sort();
  const extraInSeed = [...seeded].filter((k) => !matrix.has(k)).sort();

  console.log(`Matrix combos: ${matrix.size}`);
  console.log(`Seeded combos: ${seeded.size}`);
  console.log(`\n── MISSING from seed (matrix wants these) ── ${missingFromSeed.length}`);
  for (const k of missingFromSeed) console.log(`  + ${k.replace(/\|/g, '  ')}`);
  console.log(`\n── EXTRA in seed (matrix doesn't list these) ── ${extraInSeed.length}`);
  for (const k of extraInSeed.slice(0, 40)) console.log(`  - ${k.replace(/\|/g, '  ')}`);
  if (extraInSeed.length > 40) console.log(`  …and ${extraInSeed.length - 40} more`);

  await prisma.$disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
