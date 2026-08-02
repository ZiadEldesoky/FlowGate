import type { PurchaseRequestDecisionAction } from '@/types/approvals';
import type { AppLocale } from '@/types/locale';

export const decisionCopy = {
    ar: {
        approveManager: 'اعتماد (مدير)',
        approveProcurement: 'اعتماد (مشتريات)',
        reject: 'رفض',
        approveTitleManager: 'اعتماد مراجعة المدير',
        approveTitleProcurement: 'اعتماد مراجعة المشتريات',
        approveDescription: 'سيُسجَّل القرار من الخادم. التعليق اختياري.',
        rejectTitle: 'رفض طلب الشراء',
        rejectDescription: 'الرفض يتطلب تعليقًا واضحًا.',
        comment: 'التعليق',
        commentOptional: 'تعليق (اختياري)',
        commentRequired: 'تعليق (مطلوب)',
        commentPlaceholder: 'أضف ملاحظة للمراجعة…',
        cancel: 'إلغاء',
        confirmApprove: 'تأكيد الاعتماد',
        confirmReject: 'تأكيد الرفض',
        processing: 'جارٍ المعالجة…',
        validationSummary: 'يرجى مراجعة الحقول المحددة.',
    },
    en: {
        approveManager: 'Approve (manager)',
        approveProcurement: 'Approve (procurement)',
        reject: 'Reject',
        approveTitleManager: 'Approve manager review',
        approveTitleProcurement: 'Approve procurement review',
        approveDescription:
            'The server will record the decision. Comment is optional.',
        rejectTitle: 'Reject purchase request',
        rejectDescription: 'Rejection requires a clear comment.',
        comment: 'Comment',
        commentOptional: 'Comment (optional)',
        commentRequired: 'Comment (required)',
        commentPlaceholder: 'Add a review note…',
        cancel: 'Cancel',
        confirmApprove: 'Confirm approval',
        confirmReject: 'Confirm rejection',
        processing: 'Processing…',
        validationSummary: 'Please review the highlighted fields.',
    },
} as const;

export type DecisionCopy = (typeof decisionCopy)[AppLocale];

export function getDecisionCopy(locale: AppLocale): DecisionCopy {
    return decisionCopy[locale];
}

export function getDecisionActionLabel(
    action: PurchaseRequestDecisionAction,
    locale: AppLocale,
): string {
    const t = getDecisionCopy(locale);

    switch (action) {
        case 'approve_manager_review':
            return t.approveManager;
        case 'approve_procurement_review':
            return t.approveProcurement;
        case 'reject':
            return t.reject;
    }
}
