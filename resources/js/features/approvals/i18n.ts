import type { ApprovalQueueStage } from '@/types/approvals';
import type { AppLocale } from '@/types/locale';

export const approvalsCopy = {
    ar: {
        navTitle: 'الموافقات',
        indexTitle: 'قائمة المراجعات',
        indexDescription: 'مراجعات معلّقة يحددها الخادم حسب صلاحياتك.',
        stageLabel: 'مرحلة المراجعة',
        stageManager: 'مراجعة المدير',
        stageProcurement: 'مراجعة المشتريات',
        search: 'بحث',
        searchPlaceholder: 'مرجع أو عنوان…',
        clearFilters: 'مسح البحث',
        emptyTitle: 'لا توجد مراجعات معلّقة',
        emptyDescription: 'لا توجد طلبات بانتظار مراجعتك حاليًا.',
        reference: 'المرجع',
        title: 'العنوان',
        requester: 'مقدّم الطلب',
        department: 'القسم',
        status: 'الحالة',
        amount: 'المبلغ',
        neededBy: 'مطلوب بحلول',
        submittedAt: 'تاريخ الإرسال',
        previous: 'السابق',
        next: 'التالي',
        pageOf: 'صفحة {current} من {last}',
        showing: 'عرض {from}–{to} من {total}',
        noResultsRange: 'لا توجد نتائج',
        openRequest: 'فتح الطلب',
        notAvailable: '—',
    },
    en: {
        navTitle: 'Approvals',
        indexTitle: 'Review queue',
        indexDescription:
            'Pending reviews determined by the server for your permissions.',
        stageLabel: 'Review stage',
        stageManager: 'Manager review',
        stageProcurement: 'Procurement review',
        search: 'Search',
        searchPlaceholder: 'Reference or title…',
        clearFilters: 'Clear search',
        emptyTitle: 'No pending reviews',
        emptyDescription:
            'There are no purchase requests waiting for your review.',
        reference: 'Reference',
        title: 'Title',
        requester: 'Requester',
        department: 'Department',
        status: 'Status',
        amount: 'Amount',
        neededBy: 'Needed by',
        submittedAt: 'Submitted',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {current} of {last}',
        showing: 'Showing {from}–{to} of {total}',
        noResultsRange: 'No results',
        openRequest: 'Open request',
        notAvailable: '—',
    },
} as const;

export type ApprovalsCopy = (typeof approvalsCopy)[AppLocale];

export function getApprovalsCopy(locale: AppLocale): ApprovalsCopy {
    return approvalsCopy[locale];
}

export function getApprovalStageLabel(
    stage: ApprovalQueueStage,
    locale: AppLocale,
): string {
    const t = getApprovalsCopy(locale);

    return stage === 'manager_review' ? t.stageManager : t.stageProcurement;
}

export function formatApprovalsCopy(
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
