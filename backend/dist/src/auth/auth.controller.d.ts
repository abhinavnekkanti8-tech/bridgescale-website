import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionUser } from '../common/types/session.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, req: Request): Promise<{
        message: string;
        user: SessionUser;
    }>;
    login(loginDto: LoginDto, req: Request): Promise<{
        message: string;
        user: SessionUser;
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    magicLogin(token: string, req: Request): Promise<{
        message: string;
        user: SessionUser;
    }>;
    getSession(user: SessionUser): {
        user: SessionUser;
    };
}
