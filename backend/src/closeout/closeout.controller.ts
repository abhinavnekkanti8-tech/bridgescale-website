import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CloseoutService } from './closeout.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionUser } from '../auth/session-user.decorator';
import { UpdateCloseoutDto, SubmitRatingDto } from './dto/closeout.dto';

@Controller('engagements/:id')
@UseGuards(SessionAuthGuard, RolesGuard)
export class CloseoutController {
  constructor(private readonly service: CloseoutService) {}

  // ── Closeout Report ───────────────────────────────────────────────────

  @Get('closeout')
  getReport(@Param('id') id: string) {
    return this.service.getReport(id);
  }

  @Post('closeout/generate')
  generateReport(@Param('id') id: string) {
    return this.service.generateReport(id);
  }

  @Patch('closeout')
  updateReport(@Param('id') id: string, @Body() dto: UpdateCloseoutDto) {
    return this.service.updateReport(id, dto);
  }

  // ── Ratings ─────────────────────────────────────────────────────────────

  @Get('ratings')
  getRatings(@Param('id') id: string) {
    return this.service.getEngagementRatings(id);
  }

  @Post('ratings')
  submitRating(@Param('id') id: string, @Body() dto: SubmitRatingDto, @SessionUser() user: any) {
    return this.service.submitRating(id, user.id, dto);
  }

  // ── Renewal Recommendation ──────────────────────────────────────────────

  @Get('renewal')
  getRenewal(@Param('id') id: string) {
    return this.service.getRenewalRecommendation(id);
  }

  @Post('renewal/generate')
  generateRenewal(@Param('id') id: string) {
    return this.service.generateRenewalRecommendation(id);
  }
}
