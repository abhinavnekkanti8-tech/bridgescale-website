export declare enum RegisterRole {
    STARTUP_ADMIN = "STARTUP_ADMIN",
    OPERATOR = "OPERATOR"
}
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role: RegisterRole;
    orgName?: string;
    country?: string;
    industry?: string;
    linkedIn?: string;
}
