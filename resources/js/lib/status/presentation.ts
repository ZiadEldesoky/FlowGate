import type { AppLocale } from '@/types/locale';
import type {
    PresentationStatus,
    PresentationStatusConfig,
} from '@/types/status';

/**
 * Presentation-only workflow status configuration.
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

export const WORKFLOW_STATUSES = [
    'draft',
    'pending_manager_review',
    'pending_procurement_review',
    'approved',
    'rejected',
    'completed',
    'cancelled',
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

const STATUS_PRESENTATION_ALIASES: Readonly<
    Record<string, PresentationStatus>
> = {
    pending_manager_review: 'pending',
    pending_procurement_review: 'pending',
};

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

/**
 * Workflow-specific bilingual labels.
 * Pending stages share the pending tone but keep distinct labels.
 */
export const workflowStatusLabels: Readonly<
    Record<
        string,
        { en: string; ar: string; description: { en: string; ar: string } }
    >
> = {
    draft: {
        en: 'Draft',
        ar: 'مسودة',
        description: {
            en: 'Not yet submitted',
            ar: 'لم يتم الإرسال بعد',
        },
    },
    pending_manager_review: {
        en: 'Pending manager review',
        ar: 'بانتظار مراجعة المدير',
        description: {
            en: 'Awaiting manager decision',
            ar: 'بانتظار قرار المدير',
        },
    },
    pending_procurement_review: {
        en: 'Pending procurement review',
        ar: 'بانتظار مراجعة المشتريات',
        description: {
            en: 'Awaiting procurement decision',
            ar: 'بانتظار قرار المشتريات',
        },
    },
    approved: {
        en: 'Approved',
        ar: 'معتمد',
        description: {
            en: 'Approved for next steps',
            ar: 'معتمد للخطوات التالية',
        },
    },
    rejected: {
        en: 'Rejected',
        ar: 'مرفوض',
        description: {
            en: 'Not approved',
            ar: 'غير معتمد',
        },
    },
    completed: {
        en: 'Completed',
        ar: 'مكتمل',
        description: {
            en: 'Process finished',
            ar: 'اكتملت العملية',
        },
    },
    cancelled: {
        en: 'Cancelled',
        ar: 'ملغى',
        description: {
            en: 'No longer active',
            ar: 'لم يعد نشطًا',
        },
    },
    // generic pending fallback
    pending: {
        en: 'Pending',
        ar: 'قيد الانتظار',
        description: {
            en: 'Awaiting review',
            ar: 'بانتظار المراجعة',
        },
    },
};

export function resolvePresentationTone(
    status: string | null | undefined,
): PresentationStatus | null {
    if (!status) {
        return null;
    }

    const normalizedStatus = status.toLowerCase();

    return (
        STATUS_PRESENTATION_ALIASES[normalizedStatus] ??
        PRESENTATION_STATUSES.find(
            (candidate) => candidate === normalizedStatus,
        ) ??
        null
    );
}

export function getPresentationStatus(
    status: string | null | undefined,
): PresentationStatusConfig | null {
    const tone = resolvePresentationTone(status);

    if (!tone) {
        return null;
    }

    const base = presentationStatusConfig[tone];
    const workflow = status
        ? workflowStatusLabels[status.toLowerCase()]
        : undefined;

    if (!workflow) {
        return base;
    }

    return {
        ...base,
        label: {
            en: workflow.en,
            ar: workflow.ar,
        },
        description: workflow.description,
    };
}

export function getPresentationStatusLabel(
    status: PresentationStatus | string,
    locale: AppLocale = 'ar',
): string {
    const config = getPresentationStatus(status);

    if (config) {
        return config.label[locale];
    }

    return String(status);
}

export function getWorkflowStatusOptions(
    statuses: readonly string[],
): Array<{ value: string; label: { en: string; ar: string } }> {
    return statuses.map((status) => {
        const config = getPresentationStatus(status);

        return {
            value: status,
            label: config?.label ?? {
                en: status,
                ar: status,
            },
        };
    });
}
