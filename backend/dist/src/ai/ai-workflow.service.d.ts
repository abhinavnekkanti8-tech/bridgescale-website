import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AiService } from './ai.service';
export declare class AiWorkflowService {
    private readonly prisma;
    private readonly aiService;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, aiService: AiService, emailService: EmailService);
    generateDiagnosisForApplication(applicationId: string): Promise<void>;
}
