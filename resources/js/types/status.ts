/**
 * Presentation-only workflow status keys.
 * These values are for UI rendering and must not encode backend rules.
 */
export type PresentationStatus =
    'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export type PresentationStatusTone =
    'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export type PresentationStatusConfig = {
    key: PresentationStatus;
    tone: PresentationStatusTone;
    label: {
        en: string;
        ar: string;
    };
    description: {
        en: string;
        ar: string;
    };
    className: string;
};
