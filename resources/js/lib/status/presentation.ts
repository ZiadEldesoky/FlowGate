import type {
    PresentationStatus,
    PresentationStatusConfig,
} from '@/types/status';

/**
 * Central presentation-only status configuration.
 * Labels and styles only — no transitions, permissions, or business rules.
 */
export const PRESENTATION_STATUSES: readonly PresentationStatus[] = [
    'draft',
    'pending',
    'approved',
    'rejected',
    'completed',
    'cancelled',
] as const;

export const presentationStatusConfig: Record<
    PresentationStatus,
    PresentationStatusConfig
> = {
    draft: {
        key: 'draft',
        tone: 'draft',
        label: {
            en: 'Draft',
            ar: 'مسودة',
        },
        description: {
            en: 'Not yet submitted',
            ar: 'لم يتم الإرسال بعد',
        },
        className:
            'border-status-draft-border bg-status-draft text-status-draft-foreground',
    },
    pending: {
        key: 'pending',
        tone: 'pending',
        label: {
            en: 'Pending',
            ar: 'قيد الانتظار',
        },
        description: {
            en: 'Awaiting review',
            ar: 'بانتظار المراجعة',
        },
        className:
            'border-status-pending-border bg-status-pending text-status-pending-foreground',
    },
    approved: {
        key: 'approved',
        tone: 'approved',
        label: {
            en: 'Approved',
            ar: 'معتمد',
        },
        description: {
            en: 'Approved for next steps',
            ar: 'معتمد للخطوات التالية',
        },
        className:
            'border-status-approved-border bg-status-approved text-status-approved-foreground',
    },
    rejected: {
        key: 'rejected',
        tone: 'rejected',
        label: {
            en: 'Rejected',
            ar: 'مرفوض',
        },
        description: {
            en: 'Not approved',
            ar: 'غير معتمد',
        },
        className:
            'border-status-rejected-border bg-status-rejected text-status-rejected-foreground',
    },
    completed: {
        key: 'completed',
        tone: 'completed',
        label: {
            en: 'Completed',
            ar: 'مكتمل',
        },
        description: {
            en: 'Process finished',
            ar: 'اكتملت العملية',
        },
        className:
            'border-status-completed-border bg-status-completed text-status-completed-foreground',
    },
    cancelled: {
        key: 'cancelled',
        tone: 'cancelled',
        label: {
            en: 'Cancelled',
            ar: 'ملغى',
        },
        description: {
            en: 'No longer active',
            ar: 'لم يعد نشطًا',
        },
        className:
            'border-status-cancelled-border bg-status-cancelled text-status-cancelled-foreground',
    },
};

export function getPresentationStatus(
    status: string | null | undefined,
): PresentationStatusConfig | null {
    if (!status) {
        return null;
    }

    const key = status.toLowerCase() as PresentationStatus;

    return presentationStatusConfig[key] ?? null;
}

export function getPresentationStatusLabel(
    status: PresentationStatus,
    locale: 'ar' | 'en' = 'ar',
): string {
    return presentationStatusConfig[status].label[locale];
}
