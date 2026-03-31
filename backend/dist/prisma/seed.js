"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = require("crypto");
const prisma = new client_1.PrismaClient();
function hashPassword(password) {
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
    const platformOrg = await prisma.organization.create({
        data: {
            orgType: client_1.OrgType.PLATFORM,
            name: 'Nexus Platform Administration',
        },
    });
    const admin = await prisma.user.create({
        data: {
            name: 'Platform Admin',
            email: adminEmail,
            passwordHash,
            status: client_1.UserStatus.ACTIVE,
            memberships: {
                create: {
                    orgId: platformOrg.id,
                    membershipRole: client_1.MembershipRole.PLATFORM_ADMIN,
                    status: client_1.MembershipStatus.ACTIVE,
                },
            },
        },
    });
    const startupOrg = await prisma.organization.create({
        data: {
            orgType: client_1.OrgType.STARTUP,
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
            status: client_1.UserStatus.ACTIVE,
            memberships: {
                create: {
                    orgId: startupOrg.id,
                    membershipRole: client_1.MembershipRole.STARTUP_ADMIN,
                    status: client_1.MembershipStatus.ACTIVE,
                },
            },
        },
    });
    const operatorOrg = await prisma.organization.create({
        data: {
            orgType: client_1.OrgType.OPERATOR_ENTITY,
            name: 'DiasporaSales EU',
            country: 'DE',
        },
    });
    await prisma.user.create({
        data: {
            name: 'Priya Operator',
            email: 'priya@diasporasales.com',
            passwordHash: hashPassword('Operator@123'),
            status: client_1.UserStatus.ACTIVE,
            memberships: {
                create: {
                    orgId: operatorOrg.id,
                    membershipRole: client_1.MembershipRole.OPERATOR,
                    status: client_1.MembershipStatus.ACTIVE,
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
//# sourceMappingURL=seed.js.map