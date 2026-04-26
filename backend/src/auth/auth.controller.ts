import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { ApplicationsService } from '../applications/applications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SessionUser } from '../common/types/session.types';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TalentSignupDto } from './dto/talent-signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly applicationsService: ApplicationsService,
    private readonly config: ConfigService,
  ) {}

  private setStageCookie(res: Response, stage: string) {
    res.cookie('platform.user_stage', stage, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearRoutingCookies(res: Response) {
    res.clearCookie('platform.sid');
    res.clearCookie('platform.user_stage');
    res.clearCookie('platform.user_status');
  }

  private async establishSession(req: Request, res: Response, user: SessionUser) {
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.user = user;
    this.setStageCookie(res, user.stage);
  }

  @Post('register')
  @HttpCode(HttpStatus.GONE)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() _req: Request,
    @Res({ passthrough: true }) _res: Response,
  ) {
    return this.authService.register(registerDto);
  }

  @Post('talent/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupTalent(@Body() dto: TalentSignupDto) {
    return this.authService.registerTalentWithPassword(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionUser = await this.authService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    await this.establishSession(req, res, sessionUser);

    return {
      message: 'Login successful.',
      user: sessionUser,
      nextPath: this.authService.getPostAuthPath(sessionUser, loginDto.redirect),
    };
  }

  @Post('verify-email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmailVerification(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!dto.token) {
      throw new BadRequestException('Token is required.');
    }

    const initialUser = await this.authService.confirmEmailVerification(dto.token);
    await this.applicationsService.completeCompanyVerificationIfPending(initialUser.email);
    const sessionUser = await this.authService.getSessionUserByEmail(initialUser.email);

    await this.establishSession(req, res, sessionUser);

    return {
      message: 'Email verified successfully.',
      user: sessionUser,
      nextPath: this.authService.getPostAuthPath(sessionUser),
    };
  }

  @Post('verify-email/resend')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendEmailVerification(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await new Promise<void>((resolve) => {
      if (!req.session) {
        resolve();
        return;
      }

      req.session.destroy(() => resolve());
    });

    this.clearRoutingCookies(res);
    return { message: 'Logged out successfully.' };
  }

  @Get('oauth/:provider/start')
  async startOAuth(
    @Param('provider') provider: string,
    @Query('next') next: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const state = randomBytes(24).toString('hex');
    req.session.oauthState = { provider, state, nextPath: next };
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    return res.redirect(this.authService.getAuthorizationUrl(provider, state));
  }

  @Get('oauth/:provider/callback')
  async handleOAuthCallbackGet(
    @Param('provider') provider: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.finishOAuth(provider, code, state, error, undefined, req, res);
  }

  @Post('oauth/:provider/callback')
  async handleOAuthCallbackPost(
    @Param('provider') provider: string,
    @Body('code') code: string | undefined,
    @Body('state') state: string | undefined,
    @Body('error') error: string | undefined,
    @Body('user') appleUser: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.finishOAuth(provider, code, state, error, appleUser, req, res);
  }

  @Get('session')
  @UseGuards(SessionAuthGuard)
  getSession(@CurrentUser() user: SessionUser) {
    if (!user) throw new UnauthorizedException();
    return { user };
  }

  private async finishOAuth(
    provider: string,
    code: string | undefined,
    state: string | undefined,
    error: string | undefined,
    appleUser: string | undefined,
    req: Request,
    res: Response,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const savedState = req.session.oauthState;

    if (error) {
      return res.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent(error)}`);
    }

    if (
      !savedState ||
      savedState.provider !== provider ||
      !state ||
      savedState.state !== state ||
      !code
    ) {
      return res.redirect(
        `${frontendUrl}/auth/login?error=${encodeURIComponent('OAuth session expired. Please try again.')}`,
      );
    }

    delete req.session.oauthState;

    try {
      const sessionUser = await this.authService.handleOAuthCallback(provider, code, appleUser);
      await this.establishSession(req, res, sessionUser);
      const nextPath = this.authService.getPostAuthPath(sessionUser, savedState.nextPath);
      return res.redirect(`${frontendUrl}${nextPath}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Provider login failed. Please try again.';
      return res.redirect(`${frontendUrl}/auth/login?error=${encodeURIComponent(message)}`);
    }
  }
}
