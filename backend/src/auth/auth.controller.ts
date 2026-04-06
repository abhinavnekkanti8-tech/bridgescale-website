import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionUser } from '../common/types/session.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   * Self-registration for startups and operators.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ) {
    const sessionUser = await this.authService.register(registerDto);

    // Auto-login after registration
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.user = sessionUser;

    return {
      message: 'Registration successful.',
      user: sessionUser,
    };
  }

  /**
   * POST /api/v1/auth/login
   * Validate credentials, populate session, return user info.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ) {
    const sessionUser = await this.authService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    // Regenerate session to prevent session fixation attacks
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.user = sessionUser;

    return {
      message: 'Login successful.',
      user: sessionUser,
    };
  }

  /**
   * POST /api/v1/auth/logout
   * Destroy the current session.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => (err ? reject(err) : resolve()));
    });

    res.clearCookie('platform.sid');
    return { message: 'Logged out successfully.' };
  }

  /**
   * POST /api/v1/auth/magic
   * Validate a magic-link token and create a session.
   * Frontend hits this after the user clicks the link in their email.
   */
  @Post('magic')
  @HttpCode(HttpStatus.OK)
  async magicLogin(
    @Body('token') token: string,
    @Req() req: Request,
  ) {
    if (!token) throw new BadRequestException('Token is required.');

    const sessionUser = await this.authService.validateMagicLink(token);

    await new Promise<void>((resolve, reject) => {
      (req as any).session.regenerate((err: Error) => (err ? reject(err) : resolve()));
    });

    (req as any).session.user = sessionUser;

    return { message: 'Login successful.', user: sessionUser };
  }

  /**
   * GET /api/v1/auth/session
   * Return the currently authenticated user from the session.
   */
  @Get('session')
  @UseGuards(SessionAuthGuard)
  getSession(@CurrentUser() user: SessionUser) {
    if (!user) throw new UnauthorizedException();
    return { user };
  }
}
