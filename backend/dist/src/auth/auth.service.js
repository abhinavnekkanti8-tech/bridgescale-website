"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const register_dto_1 = require("./dto/register.dto");
const BCRYPT_SALT_ROUNDS = 10;
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, prisma) {
        this.usersService = usersService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(dto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new common_1.BadRequestException('An account with this email already exists.');
        }
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
        const orgType = dto.role === register_dto_1.RegisterRole.STARTUP_ADMIN ? 'STARTUP' : 'OPERATOR_ENTITY';
        const membershipRole = (dto.role === register_dto_1.RegisterRole.STARTUP_ADMIN ? 'STARTUP_ADMIN' : 'OPERATOR');
        const result = await this.prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: dto.orgName || `${dto.name}'s Organization`,
                    orgType,
                    country: dto.country || 'IN',
                },
            });
            const user = await tx.user.create({
                data: { name: dto.name, email: dto.email, passwordHash },
            });
            await tx.membership.create({
                data: { userId: user.id, orgId: org.id, membershipRole, status: 'ACTIVE' },
            });
            return { userId: user.id, orgId: org.id, name: user.name, email: user.email, role: membershipRole };
        });
        this.logger.log(`New user registered: ${result.email} as ${result.role}`);
        return {
            id: result.userId,
            name: result.name,
            email: result.email,
            role: result.role,
            orgId: result.orgId,
        };
    }
    async validateCredentials(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (user.status === 'SUSPENDED') {
            throw new common_1.UnauthorizedException('Your account has been suspended. Please contact support.');
        }
        if (user.status === 'INACTIVE') {
            throw new common_1.UnauthorizedException('Your account is inactive. Please contact support.');
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException('This account uses passwordless login. Please use your magic link.');
        }
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        const membership = user.memberships[0];
        if (!membership) {
            throw new common_1.BadRequestException('Your account has no active role assignment. Please contact support.');
        }
        await this.usersService.touchLoginTimestamp(user.id);
        this.logger.log(`User ${user.email} authenticated with role ${membership.membershipRole}`);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: membership.membershipRole,
            orgId: membership.orgId,
        };
    }
    async validateMagicLink(token) {
        const user = await this.prisma.user.findUnique({
            where: { magicLinkToken: token },
            include: {
                memberships: {
                    where: { status: 'ACTIVE' },
                    include: { organization: true },
                },
            },
        });
        if (!user || !user.magicLinkExpiry) {
            throw new common_1.UnauthorizedException('Invalid or expired login link.');
        }
        if (new Date() > user.magicLinkExpiry) {
            throw new common_1.UnauthorizedException('This login link has expired. Please request a new one.');
        }
        if (user.status === 'SUSPENDED') {
            throw new common_1.UnauthorizedException('Your account has been suspended. Please contact support.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: null,
                magicLinkExpiry: null,
                lastLoginAt: new Date(),
            },
        });
        await this.prisma.membership.updateMany({
            where: { userId: user.id, status: 'PENDING' },
            data: { status: 'ACTIVE' },
        });
        this.logger.log(`Magic-link login for ${user.email}`);
        const activeMemberships = await this.prisma.membership.findMany({
            where: { userId: user.id, status: 'ACTIVE' },
        });
        const membership = activeMemberships[0];
        if (!membership) {
            throw new common_1.BadRequestException('Your account has no active role. Please contact support.');
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: membership.membershipRole,
            orgId: membership.orgId,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map