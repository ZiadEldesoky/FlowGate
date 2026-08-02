import type {
    PurchaseRequestDepartment,
    PurchaseRequestListItem,
    PurchaseRequestPaginationLinks,
    PurchaseRequestPaginationMeta,
    PurchaseRequestStatus,
} from '@/types/purchase-request';

export type ReportingScope =
    'own_requests' | 'managed_departments' | 'all_requests';

export type DashboardSummary = {
    totalRequests: number;
    openRequests: number;
    actionRequiredCount: number;
    completedRequests: number;
    committedAmount: string;
    currency: 'EGP';
};

export type StatusBreakdownItem = {
    status: PurchaseRequestStatus;
    count: number;
};

export type DashboardPageProps = {
    scope: ReportingScope;
    summary: DashboardSummary;
    statusBreakdown: StatusBreakdownItem[];
    attentionRequests: PurchaseRequestListItem[];
    recentRequests: PurchaseRequestListItem[];
};

export type ProcurementReportFilters = {
    from: string;
    to: string;
    status: PurchaseRequestStatus | null;
    departmentId: number | null;
};

export type ProcurementReportFilterOptions = {
    statuses: PurchaseRequestStatus[];
    departments: PurchaseRequestDepartment[];
};

export type ProcurementReportSummary = {
    requestCount: number;
    totalAmount: string;
    averageAmount: string;
    completedCount: number;
    completionRate: string;
    currency: 'EGP';
};

export type ProcurementStatusBreakdownItem = {
    status: PurchaseRequestStatus;
    requestCount: number;
    totalAmount: string;
};

export type ProcurementDepartmentBreakdownItem = {
    department: PurchaseRequestDepartment;
    requestCount: number;
    totalAmount: string;
};

export type ProcurementMonthlyTrendItem = {
    month: string;
    requestCount: number;
    totalAmount: string;
};

export type ProcurementReportPageProps = {
    scope: ReportingScope;
    filters: ProcurementReportFilters;
    filterOptions: ProcurementReportFilterOptions;
    summary: ProcurementReportSummary;
    statusBreakdown: ProcurementStatusBreakdownItem[];
    departmentBreakdown: ProcurementDepartmentBreakdownItem[];
    monthlyTrend: ProcurementMonthlyTrendItem[];
    purchaseRequests: {
        data: PurchaseRequestListItem[];
        meta: PurchaseRequestPaginationMeta;
        links: PurchaseRequestPaginationLinks;
    };
};
