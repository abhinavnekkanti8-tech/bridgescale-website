import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionUser } from '../common/types/session.types';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly prisma;
    private readonly logger;
    constructor(usersService: UsersService, prisma: PrismaService);
    register(dto: RegisterDto): Promise<SessionUser>;
    validateCredentials(email: string, password: string): Promise<SessionUser>;
    validateMagicLink(token: string): Promise<SessionUser>;
}
