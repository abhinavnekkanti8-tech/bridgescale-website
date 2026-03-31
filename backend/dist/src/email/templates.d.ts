export declare function applicationReceivedEmail(data: {
    name: string;
    type: 'COMPANY' | 'TALENT';
    applicationId: string;
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
