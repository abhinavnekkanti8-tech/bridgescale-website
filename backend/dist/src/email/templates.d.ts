export declare function applicationReceivedEmail(data: {
    name: string;
    type: 'COMPANY' | 'TALENT';
    applicationId: string;
}): {
    subject: string;
    html: string;
};
export declare function magicLinkEmail(data: {
    name: string;
    magicUrl: string;
    expiryMinutes: number;
}): {
    subject: string;
    html: string;
};
export declare function statusUpdateEmail(data: {
    name: string;
    applicationId: string;
    newStatus: string;
}): {
    subject: string;
    html: string;
};
export declare function diagnosisGeneratedEmail(data: {
    name: string;
    type: 'COMPANY' | 'TALENT';
    recommendedRole: string;
}): {
    subject: string;
    html: string;
};
export declare function diagnosisApprovedEmail(data: {
    name: string;
    type: 'COMPANY' | 'TALENT';
}): {
    subject: string;
    html: string;
};
export declare function interviewScheduledEmail(data: {
    name: string;
    otherPartyName: string;
    scheduledAt: Date;
    meetingLink?: string;
}): {
    subject: string;
    html: string;
};
export declare function interviewOutcomeEmail(data: {
    name: string;
    decision: 'APPROVED' | 'REJECTED';
    feedback?: string;
}): {
    subject: string;
    html: string;
};
export declare function engagementApprovedEmail(data: {
    name: string;
    partnerName: string;
    engagementType: string;
    startDate: Date;
}): {
    subject: string;
    html: string;
};
