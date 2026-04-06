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
