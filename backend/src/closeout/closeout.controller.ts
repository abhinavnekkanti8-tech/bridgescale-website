import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CloseoutService } from './closeout.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionUser as SessionUserDecorator } from '../auth/session-user.decorator';
import { SessionUser as SessionUserType } from '../common/types/session.types';
import { UpdateCloseoutDto, SubmitRatingDto } from './dto/closeout.dto';

@Controller('engagements/:id')
@UseGuards(SessionAuthGuard, RolesGuard)
export class CloseoutController {
  constructor(private readonly service: CloseoutService) {}

  // ── Closeout Report ───────────────────────────────────────────────────

  @Get('closeout')
  getReport(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.service.getReport(user, id);
  }

  @Post('closeout/generate')
  generateReport(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.service.generateReport(user, id);
  }

  @Patch('closeout')
  updateReport(
    @Param('id') id: string,
    @Body() dto: UpdateCloseoutDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.service.updateReport(user, id, dto);
  }

  // ── Ratings ─────────────────────────────────────────────────────────────

  @Get('ratings')
  getRatings(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.service.getEngagementRatings(user, id);
  }

  @Post('ratings')
  submitRating(
    @Param('id') id: string,
    @Body() dto: SubmitRatingDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.service.submitRating(user, id, user.id, dto);
  }

  // ── Renewal Recommendation ──────────────────────────────────────────────

  @Get('renewal')
  getRenewal(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.service.getRenewalRecommendation(user, id);
  }

  @Post('renewal/generate')
  generateRenewal(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.service.generateRenewalRecommendation(user, id);
  }
}
