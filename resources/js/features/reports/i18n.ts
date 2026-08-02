import type { AppLocale } from '@/types/locale';
import type { ReportingScope } from '@/types/reports';

export const reportsCopy = {
    ar: {
        dashboardTitle: 'لوحة المتابعة',
        dashboardDescription: 'ملخص تشغيلي حسب نطاق عرضك من الخادم.',
        scopeLabel: 'نطاق العرض',
        scopeOwn: 'طلباتي',
        scopeManaged: 'أقسامي',
        scopeAll: 'كل الطلبات',
        totalRequests: 'إجمالي الطلبات',
        openRequests: 'طلبات مفتوحة',
        actionRequired: 'تحتاج إجراء',
        completedRequests: 'مكتملة',
        committedAmount: 'المبلغ الملتزم',
        statusBreakdown: 'توزيع الحالات',
        attentionQueue: 'يتطلب الانتباه',
        recentRequests: 'أحدث الطلبات',
        emptyAttention: 'لا توجد طلبات تحتاج إجراء الآن.',
        emptyRecent: 'لا توجد طلبات حديثة.',
        emptyStatus: 'لا توجد بيانات حالة.',
        viewAll: 'عرض الكل',
        openRequest: 'فتح',
        reportsNav: 'التقارير',
        procurementTitle: 'تقرير المشتريات التشغيلي',
        procurementDescription:
            'ملخصات وتفاصيل تشغيلية ضمن النطاق الذي يحدده الخادم.',
        filters: 'عوامل التصفية',
        from: 'من',
        to: 'إلى',
        status: 'الحالة',
        department: 'القسم',
        allStatuses: 'كل الحالات',
        allDepartments: 'كل الأقسام',
        applyFilters: 'تطبيق',
        clearFilters: 'مسح',
        exportCsv: 'تصدير CSV',
        requestCount: 'عدد الطلبات',
        totalAmount: 'إجمالي المبلغ',
        averageAmount: 'متوسط المبلغ',
        completedCount: 'المكتملة',
        completionRate: 'نسبة الإكمال',
        byStatus: 'حسب الحالة',
        byDepartment: 'حسب القسم',
        monthlyTrend: 'الاتجاه الشهري',
        detailTable: 'تفاصيل الطلبات',
        month: 'الشهر',
        count: 'العدد',
        amount: 'المبلغ',
        emptyBreakdown: 'لا توجد بيانات ضمن عوامل التصفية الحالية.',
        emptyTrend: 'لا يوجد اتجاه شهري بعد.',
        emptyTable: 'لا توجد طلبات مطابقة.',
        previous: 'السابق',
        next: 'التالي',
        pageOf: 'صفحة {current} من {last}',
        showing: 'عرض {from}–{to} من {total}',
        noResultsRange: 'لا توجد نتائج',
        notAvailable: '—',
        processing: 'جارٍ التصدير…',
    },
    en: {
        dashboardTitle: 'Dashboard',
        dashboardDescription:
            'Operational summary for the server-provided reporting scope.',
        scopeLabel: 'View scope',
        scopeOwn: 'My requests',
        scopeManaged: 'Managed departments',
        scopeAll: 'All requests',
        totalRequests: 'Total requests',
        openRequests: 'Open requests',
        actionRequired: 'Action required',
        completedRequests: 'Completed',
        committedAmount: 'Committed amount',
        statusBreakdown: 'Status breakdown',
        attentionQueue: 'Needs attention',
        recentRequests: 'Recent requests',
        emptyAttention: 'No requests need action right now.',
        emptyRecent: 'No recent requests.',
        emptyStatus: 'No status data yet.',
        viewAll: 'View all',
        openRequest: 'Open',
        reportsNav: 'Reports',
        procurementTitle: 'Procurement operations report',
        procurementDescription:
            'Operational summaries and detail within the server-provided scope.',
        filters: 'Filters',
        from: 'From',
        to: 'To',
        status: 'Status',
        department: 'Department',
        allStatuses: 'All statuses',
        allDepartments: 'All departments',
        applyFilters: 'Apply',
        clearFilters: 'Clear',
        exportCsv: 'Export CSV',
        requestCount: 'Requests',
        totalAmount: 'Total amount',
        averageAmount: 'Average amount',
        completedCount: 'Completed',
        completionRate: 'Completion rate',
        byStatus: 'By status',
        byDepartment: 'By department',
        monthlyTrend: 'Monthly trend',
        detailTable: 'Request details',
        month: 'Month',
        count: 'Count',
        amount: 'Amount',
        emptyBreakdown: 'No data for the current filters.',
        emptyTrend: 'No monthly trend yet.',
        emptyTable: 'No matching requests.',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {current} of {last}',
        showing: 'Showing {from}–{to} of {total}',
        noResultsRange: 'No results',
        notAvailable: '—',
        processing: 'Exporting…',
    },
} as const;

export type ReportsCopy = (typeof reportsCopy)[AppLocale];

export function getReportsCopy(locale: AppLocale): ReportsCopy {
    return reportsCopy[locale];
}

export function getReportingScopeLabel(
    scope: ReportingScope,
    locale: AppLocale,
): string {
    const t = getReportsCopy(locale);

    switch (scope) {
        case 'own_requests':
            return t.scopeOwn;
        case 'managed_departments':
            return t.scopeManaged;
        case 'all_requests':
            return t.scopeAll;
    }
}

export function formatReportsCopy(
    template: string,
    values: Record<string, string | number | null | undefined>,
): string {
    return Object.entries(values).reduce((result, [key, value]) => {
        return result.replaceAll(
            `{${key}}`,
            value == null ? '—' : String(value),
        );
    }, template);
}
