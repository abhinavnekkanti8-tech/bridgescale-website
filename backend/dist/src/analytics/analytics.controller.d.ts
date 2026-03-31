import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly service;
    constructor(service: AnalyticsService);
    getDashboardMetrics(): Promise<import("./analytics.service").AdminDashboardMetrics>;
}
