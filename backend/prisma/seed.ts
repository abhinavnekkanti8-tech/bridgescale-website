/**
 * Prisma Seed Script
 * Seeds the Platform Admin account for initial access.
 *
 * Run with: npm run seed
 */

import { PrismaClient, OrgType, MembershipRole, MembershipStatus, UserStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Simple hash for MVP dev — NOT for production use
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@platform.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!';

  console.log('🌱 Seeding database...');

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`ℹ️  Platform Admin already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = hashPassword(adminPassword);

  // Create the platform organisation
  const platformOrg = await prisma.organization.create({
    data: {
      orgType: OrgType.PLATFORM,
      name: 'Nexus Platform Administration',
    },
  });

  // Create the admin user with an active membership
  const admin = await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: adminEmail,
      passwordHash,
      status: UserStatus.ACTIVE,
      memberships: {
        create: {
          orgId: platformOrg.id,
          membershipRole: MembershipRole.PLATFORM_ADMIN,
          status: MembershipStatus.ACTIVE,
        },
      },
    },
  });

  // Seed a demo Startup user
  const startupOrg = await prisma.organization.create({
    data: {
      orgType: OrgType.STARTUP,
      name: 'AcmeTech Hyderabad',
      country: 'IN',
      website: 'https://acmetech.example.com',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Ravi Founder',
      email: 'ravi@acmetech.com',
      passwordHash: hashPassword('Startup@123'),
      status: UserStatus.ACTIVE,
      memberships: {
        create: {
          orgId: startupOrg.id,
          membershipRole: MembershipRole.STARTUP_ADMIN,
          status: MembershipStatus.ACTIVE,
        },
      },
    },
  });

  // Seed a demo Operator user
  const operatorOrg = await prisma.organization.create({
    data: {
      orgType: OrgType.OPERATOR_ENTITY,
      name: 'DiasporaSales EU',
      country: 'DE',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Priya Operator',
      email: 'priya@diasporasales.com',
      passwordHash: hashPassword('Operator@123'),
      status: UserStatus.ACTIVE,
      memberships: {
        create: {
          orgId: operatorOrg.id,
          membershipRole: MembershipRole.OPERATOR,
          status: MembershipStatus.ACTIVE,
        },
      },
    },
  });

  console.log(`✅ Platform Admin created: ${admin.email} / ${adminPassword}`);
  console.log(`✅ Demo Startup: ravi@acmetech.com / Startup@123`);
  console.log(`✅ Demo Operator: priya@diasporasales.com / Operator@123`);
  console.log(`⚠️  Change passwords before production!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
