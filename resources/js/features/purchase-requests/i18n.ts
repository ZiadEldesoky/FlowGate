import type { AppLocale } from '@/types/locale';

export const purchaseRequestCopy = {
    ar: {
        navTitle: 'طلبات الشراء',
        indexTitle: 'طلبات الشراء',
        indexDescription: 'متابعة طلبات الشراء حسب الحالة والمرجع.',
        createTitle: 'طلب شراء جديد',
        createDescription: 'أدخل بيانات الطلب وبنود الشراء ثم احفظ كمسودة.',
        editTitle: 'تعديل طلب الشراء',
        editDescription: 'حدّث بيانات المسودة قبل الإرسال للمراجعة.',
        showTitle: 'تفاصيل طلب الشراء',
        newRequest: 'طلب جديد',
        search: 'بحث',
        searchPlaceholder: 'مرجع أو عنوان…',
        status: 'الحالة',
        allStatuses: 'كل الحالات',
        clearFilters: 'مسح عوامل التصفية',
        emptyTitle: 'لا توجد طلبات',
        emptyDescription:
            'لا توجد نتائج مطابقة. عدّل عوامل التصفية أو أنشئ طلبًا جديدًا.',
        reference: 'المرجع',
        title: 'العنوان',
        requester: 'مقدّم الطلب',
        department: 'القسم',
        amount: 'المبلغ',
        submittedAt: 'تاريخ الإرسال',
        createdAt: 'تاريخ الإنشاء',
        neededBy: 'مطلوب بحلول',
        previous: 'السابق',
        next: 'التالي',
        pageOf: 'صفحة {current} من {last}',
        showing: 'عرض {from}–{to} من {total}',
        noResultsRange: 'لا توجد نتائج',
        justification: 'المبرر',
        currency: 'العملة',
        items: 'البنود',
        itemDescription: 'الوصف',
        sku: 'رمز الصنف',
        quantity: 'الكمية',
        unitPrice: 'سعر الوحدة',
        lineTotal: 'إجمالي البند',
        addItem: 'إضافة بند',
        removeItem: 'حذف البند',
        saveDraft: 'حفظ المسودة',
        updateDraft: 'تحديث المسودة',
        cancel: 'إلغاء',
        submit: 'إرسال للمراجعة',
        confirmSubmitTitle: 'إرسال طلب الشراء؟',
        confirmSubmitDescription:
            'سينتقل الطلب إلى مراجعة المدير ولن يعود متاحًا للتعديل بعد الإرسال.',
        confirmSubmitAction: 'تأكيد الإرسال',
        completeRequest: 'إكمال الطلب',
        completeRequestTitle: 'إكمال طلب الشراء؟',
        completeRequestDescription:
            'سيُسجَّل الطلب كمكتمل، وهذه حالة نهائية لا يمكن التراجع عنها.',
        confirmCompleteAction: 'تأكيد الإكمال',
        cancelRequest: 'إلغاء الطلب',
        cancelRequestTitle: 'إلغاء طلب الشراء؟',
        cancelRequestDescription:
            'سيُغلق الطلب كملغى، وهذه حالة نهائية لا يمكن التراجع عنها.',
        cancellationReasonOptional: 'سبب الإلغاء (اختياري)',
        cancellationReasonPlaceholder: 'أضف سببًا مختصرًا للإلغاء…',
        confirmCancellationAction: 'تأكيد الإلغاء',
        lifecycleValidationSummary: 'يرجى مراجعة سبب الإلغاء.',
        edit: 'تعديل',
        backToList: 'العودة للقائمة',
        processing: 'جارٍ المعالجة…',
        estimatedTotal: 'إجمالي تقديري (معاينة)',
        estimatedTotalNote:
            'هذا تقدير واجهة فقط. الإجمالي النهائي يُحسب ويُعتمد من الخادم.',
        serverTotal: 'الإجمالي (من الخادم)',
        approvals: 'الموافقات',
        activity: 'سجل النشاط',
        noApprovals: 'لا توجد موافقات مسجّلة بعد.',
        noActivity: 'لا يوجد نشاط مسجّل بعد.',
        stage: 'المرحلة',
        decision: 'القرار',
        comment: 'تعليق',
        decidedAt: 'تاريخ القرار',
        actor: 'المستخدم',
        action: 'الإجراء',
        fromStatus: 'من',
        toStatus: 'إلى',
        email: 'البريد',
        code: 'الرمز',
        itemCount: 'عدد البنود',
        minItems: 'بند واحد على الأقل مطلوب.',
        maxItems: 'الحد الأقصى 25 بندًا.',
        validationTitle: 'تعذّر حفظ المسودة',
        validationSummary: 'يرجى مراجعة الحقول المحددة والمحاولة مرة أخرى.',
        notAvailable: '—',
    },
    en: {
        navTitle: 'Purchase requests',
        indexTitle: 'Purchase requests',
        indexDescription: 'Track purchase requests by status and reference.',
        createTitle: 'New purchase request',
        createDescription:
            'Enter request details and line items, then save as a draft.',
        editTitle: 'Edit purchase request',
        editDescription: 'Update the draft before submitting for review.',
        showTitle: 'Purchase request details',
        newRequest: 'New request',
        search: 'Search',
        searchPlaceholder: 'Reference or title…',
        status: 'Status',
        allStatuses: 'All statuses',
        clearFilters: 'Clear filters',
        emptyTitle: 'No purchase requests',
        emptyDescription:
            'No matching results. Adjust filters or create a new request.',
        reference: 'Reference',
        title: 'Title',
        requester: 'Requester',
        department: 'Department',
        amount: 'Amount',
        submittedAt: 'Submitted',
        createdAt: 'Created',
        neededBy: 'Needed by',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {current} of {last}',
        showing: 'Showing {from}–{to} of {total}',
        noResultsRange: 'No results',
        justification: 'Justification',
        currency: 'Currency',
        items: 'Items',
        itemDescription: 'Description',
        sku: 'SKU',
        quantity: 'Quantity',
        unitPrice: 'Unit price',
        lineTotal: 'Line total',
        addItem: 'Add item',
        removeItem: 'Remove item',
        saveDraft: 'Save draft',
        updateDraft: 'Update draft',
        cancel: 'Cancel',
        submit: 'Submit for review',
        confirmSubmitTitle: 'Submit this purchase request?',
        confirmSubmitDescription:
            'The request will move to manager review and can no longer be edited after submission.',
        confirmSubmitAction: 'Confirm submission',
        completeRequest: 'Complete request',
        completeRequestTitle: 'Complete this purchase request?',
        completeRequestDescription:
            'The request will be recorded as completed. This terminal state cannot be reversed.',
        confirmCompleteAction: 'Confirm completion',
        cancelRequest: 'Cancel request',
        cancelRequestTitle: 'Cancel this purchase request?',
        cancelRequestDescription:
            'The request will be closed as cancelled. This terminal state cannot be reversed.',
        cancellationReasonOptional: 'Cancellation reason (optional)',
        cancellationReasonPlaceholder: 'Add a brief cancellation reason…',
        confirmCancellationAction: 'Confirm cancellation',
        lifecycleValidationSummary: 'Please review the cancellation reason.',
        edit: 'Edit',
        backToList: 'Back to list',
        processing: 'Processing…',
        estimatedTotal: 'Estimated total (preview)',
        estimatedTotalNote:
            'Browser estimate only. Final totals remain server-owned.',
        serverTotal: 'Total (server)',
        approvals: 'Approvals',
        activity: 'Activity',
        noApprovals: 'No approvals recorded yet.',
        noActivity: 'No activity recorded yet.',
        stage: 'Stage',
        decision: 'Decision',
        comment: 'Comment',
        decidedAt: 'Decided at',
        actor: 'Actor',
        action: 'Action',
        fromStatus: 'From',
        toStatus: 'To',
        email: 'Email',
        code: 'Code',
        itemCount: 'Items',
        minItems: 'At least one item is required.',
        maxItems: 'A maximum of 25 items is allowed.',
        validationTitle: 'Draft could not be saved',
        validationSummary:
            'Please review the highlighted fields and try again.',
        notAvailable: '—',
    },
} as const;

export type PurchaseRequestCopy = (typeof purchaseRequestCopy)[AppLocale];

export function getPurchaseRequestCopy(locale: AppLocale): PurchaseRequestCopy {
    return purchaseRequestCopy[locale];
}

export function formatCopy(
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

const stageLabels: Readonly<
    Record<string, Readonly<Record<AppLocale, string>>>
> = {
    manager_review: {
        ar: 'مراجعة المدير',
        en: 'Manager review',
    },
    procurement_review: {
        ar: 'مراجعة المشتريات',
        en: 'Procurement review',
    },
};

const decisionLabels: Readonly<
    Record<string, Readonly<Record<AppLocale, string>>>
> = {
    approved: {
        ar: 'موافقة',
        en: 'Approved',
    },
    rejected: {
        ar: 'رفض',
        en: 'Rejected',
    },
};

const actionLabels: Readonly<
    Record<string, Readonly<Record<AppLocale, string>>>
> = {
    submit: {
        ar: 'إرسال للمراجعة',
        en: 'Submitted for review',
    },
    approve_manager_review: {
        ar: 'موافقة المدير',
        en: 'Manager approved',
    },
    approve_procurement_review: {
        ar: 'موافقة المشتريات',
        en: 'Procurement approved',
    },
    reject: {
        ar: 'رفض الطلب',
        en: 'Request rejected',
    },
    complete: {
        ar: 'إكمال الطلب',
        en: 'Request completed',
    },
    cancel: {
        ar: 'إلغاء الطلب',
        en: 'Request cancelled',
    },
};

const lookupLabel = (
    labels: Readonly<Record<string, Readonly<Record<AppLocale, string>>>>,
    value: string,
    locale: AppLocale,
): string => labels[value]?.[locale] ?? value.replaceAll('_', ' ');

export function getPurchaseRequestStageLabel(
    stage: string,
    locale: AppLocale,
): string {
    return lookupLabel(stageLabels, stage, locale);
}

export function getPurchaseRequestDecisionLabel(
    decision: string,
    locale: AppLocale,
): string {
    return lookupLabel(decisionLabels, decision, locale);
}

export function getPurchaseRequestActionLabel(
    action: string,
    locale: AppLocale,
): string {
    return lookupLabel(actionLabels, action, locale);
}
