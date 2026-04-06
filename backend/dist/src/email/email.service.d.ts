import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private resend;
    private readonly fromAddress;
    private readonly isDummy;
    constructor(config: ConfigService);
    sendApplicationReceived(application: {
        id: string;
        name: string;
        email: string;
        type: 'COMPANY' | 'TALENT';
    }): Promise<void>;
    sendStatusUpdate(application: {
        id: string;
        name: string;
        email: string;
    }, newStatus: string): Promise<void>;
    sendMagicLink(params: {
        name: string;
        email: string;
        magicUrl: string;
        expiryMinutes?: number;
    }): Promise<void>;
    sendDiagnosisGenerated(params: {
        email: string;
        name: string;
        type: 'COMPANY' | 'TALENT';
        recommendedRole: string;
    }): Promise<void>;
    sendDiagnosisApproved(params: {
        email: string;
        name: string;
        type: 'COMPANY' | 'TALENT';
    }): Promise<void>;
    private send;
}
