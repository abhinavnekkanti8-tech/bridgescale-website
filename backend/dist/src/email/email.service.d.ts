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
    private send;
}
