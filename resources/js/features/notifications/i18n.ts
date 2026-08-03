import { formatDateTime } from '@/features/purchase-requests/utils';
import type { AppLocale } from '@/types/locale';
import type { UserNotification } from '@/types/notifications';

export const notificationCopy = {
    ar: {
        navTitle: 'الإشعارات',
        indexTitle: 'الإشعارات',
        indexDescription: 'تحديثات سير طلبات الشراء التي تخصك.',
        unreadSummary: '{count} غير مقروء',
        markAllRead: 'تحديد الكل كمقروء',
        emptyTitle: 'لا توجد إشعارات',
        emptyDescription: 'ستظهر هنا تحديثات الطلبات التي تحتاج انتباهك.',
        status: 'الحالة',
        update: 'التحديث',
        request: 'الطلب',
        occurredAt: 'التاريخ',
        actions: 'الإجراءات',
        unread: 'غير مقروء',
        read: 'مقروء',
        markRead: 'تحديد كمقروء',
        openRequest: 'فتح الطلب',
        previous: 'السابق',
        next: 'التالي',
        pageOf: 'صفحة {current} من {last}',
        showing: 'عرض {from}–{to} من {total}',
        noResultsRange: 'لا توجد نتائج',
        processing: 'جارٍ المعالجة…',
        stageManager: 'مراجعة المدير',
        stageProcurement: 'مراجعة المشتريات',
        message: {
            submit: 'أرسل {actor} الطلب {reference} لمراجعة المدير.',
            approveManager: 'اعتمد {actor} مراجعة المدير للطلب {reference}.',
            approveProcurement:
                'اعتمد {actor} مراجعة المشتريات للطلب {reference}.',
            reject: 'رفض {actor} الطلب {reference}.',
            complete: 'أكمل {actor} الطلب {reference}.',
            cancel: 'ألغى {actor} الطلب {reference}.',
            fallback: 'تم تحديث الطلب {reference} بواسطة {actor}.',
            reviewOverdue: 'تأخرت {stage} للطلب {reference}. الموعد كان {due}.',
        },
    },
    en: {
        navTitle: 'Notifications',
        indexTitle: 'Notifications',
        indexDescription:
            'Purchase request workflow updates that are relevant to you.',
        unreadSummary: '{count} unread',
        markAllRead: 'Mark all as read',
        emptyTitle: 'No notifications',
        emptyDescription:
            'Purchase request updates that need your attention will appear here.',
        status: 'Status',
        update: 'Update',
        request: 'Request',
        occurredAt: 'Date',
        actions: 'Actions',
        unread: 'Unread',
        read: 'Read',
        markRead: 'Mark as read',
        openRequest: 'Open request',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {current} of {last}',
        showing: 'Showing {from}–{to} of {total}',
        noResultsRange: 'No results',
        processing: 'Processing…',
        stageManager: 'Manager review',
        stageProcurement: 'Procurement review',
        message: {
            submit: '{actor} submitted {reference} for manager review.',
            approveManager: '{actor} approved manager review for {reference}.',
            approveProcurement:
                '{actor} approved procurement review for {reference}.',
            reject: '{actor} rejected {reference}.',
            complete: '{actor} completed {reference}.',
            cancel: '{actor} cancelled {reference}.',
            fallback: '{reference} was updated by {actor}.',
            reviewOverdue: '{stage} for {reference} is overdue. Due {due}.',
        },
    },
} as const;

export type NotificationCopy = (typeof notificationCopy)[AppLocale];

export function getNotificationCopy(locale: AppLocale): NotificationCopy {
    return notificationCopy[locale];
}

export function formatNotificationCopy(
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

function stageLabel(stage: string, locale: AppLocale): string {
    const t = getNotificationCopy(locale);

    switch (stage) {
        case 'manager_review':
            return t.stageManager;
        case 'procurement_review':
            return t.stageProcurement;
        default:
            return stage;
    }
}

export function getNotificationMessage(
    notification: UserNotification,
    locale: AppLocale,
): string {
    const t = getNotificationCopy(locale);

    if (notification.kind === 'purchase_request_review_overdue') {
        return formatNotificationCopy(t.message.reviewOverdue, {
            stage: stageLabel(notification.stage, locale),
            reference: notification.reference,
            due:
                formatDateTime(notification.reviewDueAt, locale) ??
                notification.reviewDueAt,
        });
    }

    const template = (() => {
        switch (notification.action) {
            case 'submit':
                return t.message.submit;
            case 'approve_manager_review':
                return t.message.approveManager;
            case 'approve_procurement_review':
                return t.message.approveProcurement;
            case 'reject':
                return t.message.reject;
            case 'complete':
                return t.message.complete;
            case 'cancel':
                return t.message.cancel;
            default:
                return t.message.fallback;
        }
    })();

    return formatNotificationCopy(template, {
        actor: notification.actorName,
        reference: notification.reference,
    });
}
