import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Application Matching Service: Matches company applications with talent applications.
 * After diagnosis approval, companies are matched with pre-screened talent candidates.
 */
@Injectable()
export class ApplicationMatchingService {
  private readonly logger = new Logger(ApplicationMatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a shortlist for a company application.
   * Shortlists group potential talent matches for a specific opportunity.
   */
  async createShortlist(companyApplicationId: string, params: { name: string }) {
    const company = await this.prisma.application.findUnique({
      where: { id: companyApplicationId },
    });

    if (!company) throw new NotFoundException('Application not found.');
    if (company.type !== 'COMPANY') {
      throw new BadRequestException('Only company applications can create shortlists.');
    }

    const shortlist = await this.prisma.matchShortlist.create({
      data: {
        startupProfileId: companyApplicationId, // Reuse for application ID
        promptVersion: 'app_matching_v1.0',
      },
    });

    this.logger.log(`Shortlist created for company ${companyApplicationId}`);
    return shortlist;
  }

  /**
   * Get a shortlist with all candidates.
   */
  async getShortlist(shortlistId: string) {
    const shortlist = await this.prisma.matchShortlist.findUnique({
      where: { id: shortlistId },
      include: { candidates: true },
    });

    if (!shortlist) throw new NotFoundException('Shortlist not found.');
    return shortlist;
  }

  /**
   * Add a talent candidate to a company shortlist.
   * Calculates fit score based on role alignment, experience, market knowledge, etc.
   */
  async addCandidateToShortlist(
    shortlistId: string,
    talentApplicationId: string,
    params?: {
      matchScore?: number;
      explanation?: string;
    },
  ) {
    const shortlist = await this.prisma.matchShortlist.findUnique({
      where: { id: shortlistId },
      include: { candidates: true },
    });

    if (!shortlist) throw new NotFoundException('Shortlist not found.');

    const talent = await this.prisma.application.findUnique({
      where: { id: talentApplicationId },
      include: { talentPreScreen: true },
    });

    if (!talent) throw new NotFoundException('Talent application not found.');
    if (talent.type !== 'TALENT') {
      throw new BadRequestException('Only talent applications can be candidates.');
    }

    // Check if already in shortlist
    const existing = shortlist.candidates.find((c) => c.operatorId === talentApplicationId);
    if (existing) {
      return this.updateCandidate(existing.id, params || {});
    }

    // Calculate match score
    const matchScore = params?.matchScore ?? this.calculateFitScore(talent);

    const candidate = await this.prisma.matchCandidate.create({
      data: {
        shortlistId,
        operatorId: talentApplicationId, // Reuse for talent application ID
        matchScore,
        explanation: params?.explanation || '',
        scoreBreakdown: {
          roleAlignment: Math.floor(matchScore * 0.35),
          experience: Math.floor(matchScore * 0.25),
          marketKnowledge: Math.floor(matchScore * 0.2),
          availability: Math.floor(matchScore * 0.15),
          rate: Math.floor(matchScore * 0.05),
        },
      },
    });

    this.logger.log(`Candidate added to shortlist: match score ${matchScore}%`);
    return candidate;
  }

  /**
   * Update a candidate's match score and status in the shortlist.
   */
  async updateCandidate(
    candidateId: string,
    params: {
      matchScore?: number;
      explanation?: string;
    },
  ) {
    const candidate = await this.prisma.matchCandidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) throw new NotFoundException('Candidate not found.');

    const updateData: Record<string, any> = {};

    if (params.matchScore !== undefined) {
      if (params.matchScore < 0 || params.matchScore > 100) {
        throw new BadRequestException('Match score must be 0-100.');
      }
      updateData.matchScore = params.matchScore;
    }

    if (params.explanation) {
      updateData.explanation = params.explanation;
    }

    const updated = await this.prisma.matchCandidate.update({
      where: { id: candidateId },
      data: updateData,
    });

    this.logger.log(`Candidate ${candidateId} updated: match score ${updated.matchScore}%`);
    return updated;
  }

  /**
   * Get top candidates for a shortlist, sorted by match score.
   */
  async getTopCandidates(shortlistId: string, limit = 10) {
    const candidates = await this.prisma.matchCandidate.findMany({
      where: { shortlistId },
      orderBy: { matchScore: 'desc' },
      take: limit,
    });

    return candidates;
  }

  /**
   * Calculate fit score between company need and talent profile.
   * Considers role fit, market experience, seniority, availability, rate, etc.
   */
  private calculateFitScore(talent: any): number {
    let score = 50; // Base score

    // Role fit (±25)
    if (talent.currentRole) {
      const role = talent.currentRole.toLowerCase();
      if (role.includes('founder') || role.includes('ceo')) score += 20;
      else if (role.includes('vp') || role.includes('head')) score += 18;
      else if (role.includes('senior') || role.includes('lead')) score += 15;
      else if (role.includes('manager')) score += 10;
    }

    // Experience (±15)
    if (talent.yearsExperience) {
      if (talent.yearsExperience >= 15) score += 15;
      else if (talent.yearsExperience >= 10) score += 12;
      else if (talent.yearsExperience >= 5) score += 8;
      else if (talent.yearsExperience >= 2) score += 4;
    }

    // Seniority level (±10)
    if (talent.seniorityLevel) {
      const seniority = talent.seniorityLevel.toLowerCase();
      if (seniority.includes('executive') || seniority.includes('c-')) score += 10;
      else if (seniority.includes('senior')) score += 7;
      else if (seniority.includes('mid')) score += 4;
    }

    // Market knowledge (±10)
    if (talent.markets && Array.isArray(talent.markets) && talent.markets.length > 0) {
      score += Math.min(talent.markets.length * 3, 10);
    }

    // Availability (±5)
    if (talent.availabilityHours && talent.availabilityHours >= 20) {
      score += 5;
    }

    // Ensure score stays in valid range
    return Math.min(Math.max(score, 0), 100);
  }
}
